const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Add part to a job (admin only)
router.post(
  '/jobs/:jobId/parts',
  authenticate,
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('Part name is required')],
  validate,
  async (req, res) => {
    try {
      const { name, partNumber, supplier, quantityOrdered, unitCost } = req.body;
      const jobId = parseInt(req.params.jobId);

      const job = await prisma.repairJob.findUnique({ where: { id: jobId } });
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const part = await prisma.part.create({
        data: {
          repairJobId: jobId,
          name,
          partNumber,
          supplier,
          quantityOrdered: quantityOrdered ? parseInt(quantityOrdered) : 1,
          unitCost: unitCost ? parseFloat(unitCost) : 0,
          status: 'ORDERED',
        },
      });
      res.status(201).json(part);
    } catch (err) {
      console.error('Create part error:', err);
      res.status(500).json({ error: 'Failed to create part' });
    }
  }
);

// List parts for a job
router.get('/jobs/:jobId/parts', authenticate, async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const job = await prisma.repairJob.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (req.user.role !== 'ADMIN' && job.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const parts = await prisma.part.findMany({
      where: { repairJobId: jobId },
      orderBy: { orderedAt: 'desc' },
    });
    res.json(parts);
  } catch (err) {
    console.error('List parts error:', err);
    res.status(500).json({ error: 'Failed to list parts' });
  }
});

// Update part (admin only)
router.put('/parts/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, partNumber, supplier, quantityOrdered, quantityReceived, unitCost, status } = req.body;
    const data = {};

    if (name) data.name = name;
    if (partNumber !== undefined) data.partNumber = partNumber;
    if (supplier !== undefined) data.supplier = supplier;
    if (quantityOrdered) data.quantityOrdered = parseInt(quantityOrdered);
    if (quantityReceived !== undefined) data.quantityReceived = parseInt(quantityReceived);
    if (unitCost !== undefined) data.unitCost = parseFloat(unitCost);
    if (status) {
      data.status = status;
      if (status === 'RECEIVED' || status === 'INSTALLED') {
        data.receivedAt = new Date();
      }
    }

    const part = await prisma.part.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(part);
  } catch (err) {
    console.error('Update part error:', err);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

module.exports = router;
