const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Create invoice for a job (admin only)
router.post('/jobs/:jobId/invoice', authenticate, requireAdmin, async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const job = await prisma.repairJob.findUnique({
      where: { id: jobId },
      include: { parts: true, invoice: true },
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (job.invoice) {
      return res.status(400).json({ error: 'Invoice already exists for this job' });
    }

    const { laborCost, notes } = req.body;
    const partsCost = job.parts.reduce((sum, p) => sum + p.unitCost * p.quantityOrdered, 0);
    const labor = laborCost ? parseFloat(laborCost) : 0;
    const totalCost = labor + partsCost;

    const invoice = await prisma.invoice.create({
      data: {
        repairJobId: jobId,
        customerId: job.customerId,
        laborCost: labor,
        partsCost,
        totalCost,
        status: 'DRAFT',
        notes,
      },
    });
    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// List invoices
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { customerId: req.user.id };
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        repairJob: { include: { mower: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
    res.json(invoices);
  } catch (err) {
    console.error('List invoices error:', err);
    res.status(500).json({ error: 'Failed to list invoices' });
  }
});

// Get invoice detail
router.get('/invoices/:id', authenticate, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
        repairJob: { include: { mower: true, parts: true } },
      },
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (req.user.role !== 'ADMIN' && invoice.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(invoice);
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// Update invoice (admin only)
router.put('/invoices/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { laborCost, partsCost, totalCost, status, notes } = req.body;
    const data = {};

    if (laborCost !== undefined) data.laborCost = parseFloat(laborCost);
    if (partsCost !== undefined) data.partsCost = parseFloat(partsCost);
    if (totalCost !== undefined) data.totalCost = parseFloat(totalCost);
    if (notes !== undefined) data.notes = notes;
    if (status) {
      data.status = status;
      if (status === 'PAID') data.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        repairJob: { include: { mower: true } },
      },
    });
    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

module.exports = router;
