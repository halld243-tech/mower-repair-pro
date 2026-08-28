const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Add a mower
router.post(
  '/',
  authenticate,
  [
    body('make').trim().notEmpty().withMessage('Make is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { make, model, year, serialNumber, notes, customerId } = req.body;
      const ownerId = req.user.role === 'ADMIN' && customerId ? parseInt(customerId) : req.user.id;

      const mower = await prisma.mower.create({
        data: { customerId: ownerId, make, model, year: year ? parseInt(year) : null, serialNumber, notes },
      });
      res.status(201).json(mower);
    } catch (err) {
      console.error('Create mower error:', err);
      res.status(500).json({ error: 'Failed to create mower' });
    }
  }
);

// List mowers
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { customerId: req.user.id };
    const mowers = await prisma.mower.findMany({
      where,
      include: { customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(mowers);
  } catch (err) {
    console.error('List mowers error:', err);
    res.status(500).json({ error: 'Failed to list mowers' });
  }
});

// Get mower detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const mower = await prisma.mower.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        repairJobs: { include: { parts: true, invoice: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!mower) {
      return res.status(404).json({ error: 'Mower not found' });
    }
    if (req.user.role !== 'ADMIN' && mower.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(mower);
  } catch (err) {
    console.error('Get mower error:', err);
    res.status(500).json({ error: 'Failed to get mower' });
  }
});

// Update mower
router.put('/:id', authenticate, async (req, res) => {
  try {
    const mower = await prisma.mower.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!mower) {
      return res.status(404).json({ error: 'Mower not found' });
    }
    if (req.user.role !== 'ADMIN' && mower.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { make, model, year, serialNumber, notes } = req.body;
    const updated = await prisma.mower.update({
      where: { id: parseInt(req.params.id) },
      data: { make, model, year: year ? parseInt(year) : null, serialNumber, notes },
    });
    res.json(updated);
  } catch (err) {
    console.error('Update mower error:', err);
    res.status(500).json({ error: 'Failed to update mower' });
  }
});

module.exports = router;
