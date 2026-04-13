const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Submit a repair request
router.post(
  '/',
  authenticate,
  [
    body('mowerId').isInt().withMessage('Mower ID is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { mowerId, description } = req.body;
      const mower = await prisma.mower.findUnique({ where: { id: parseInt(mowerId) } });
      if (!mower) {
        return res.status(404).json({ error: 'Mower not found' });
      }
      if (req.user.role !== 'ADMIN' && mower.customerId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const job = await prisma.repairJob.create({
        data: {
          mowerId: parseInt(mowerId),
          customerId: mower.customerId,
          description,
          status: 'SUBMITTED',
        },
        include: { mower: true },
      });
      res.status(201).json(job);
    } catch (err) {
      console.error('Create job error:', err);
      res.status(500).json({ error: 'Failed to create repair job' });
    }
  }
);

// List jobs
router.get('/', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { customerId: req.user.id };
    const jobs = await prisma.repairJob.findMany({
      where,
      include: {
        mower: true,
        customer: { select: { id: true, name: true, email: true } },
        invoice: true,
        _count: { select: { parts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err) {
    console.error('List jobs error:', err);
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

// Get job detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.repairJob.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        mower: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        parts: true,
        invoice: true,
      },
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (req.user.role !== 'ADMIN' && job.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(job);
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Update job
router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.repairJob.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (req.user.role !== 'ADMIN' && job.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, techNotes, description } = req.body;
    const data = {};

    // Only admin can update status and tech notes
    if (req.user.role === 'ADMIN') {
      if (status) data.status = status;
      if (techNotes !== undefined) data.techNotes = techNotes;
      if (status === 'COMPLETED') data.completedAt = new Date();
    }

    // Customers can update description if still submitted
    if (req.user.role === 'CUSTOMER' && job.status === 'SUBMITTED' && description) {
      data.description = description;
    }

    const updated = await prisma.repairJob.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { mower: true, parts: true, invoice: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

module.exports = router;
