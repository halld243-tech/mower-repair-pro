const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// List all customers (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (err) {
    console.error('List customers error:', err);
    res.status(500).json({ error: 'Failed to list customers' });
  }
});

// Get customer detail (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, name: true, email: true, phone: true, address: true, createdAt: true, role: true,
        mowers: true,
        repairJobs: { include: { mower: true, invoice: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer || customer.role !== 'CUSTOMER') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

// Update customer (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true },
    });
    res.json(customer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

module.exports = router;
