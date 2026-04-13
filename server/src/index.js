require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const mowerRoutes = require('./routes/mowers');
const jobRoutes = require('./routes/jobs');
const partsRoutes = require('./routes/parts');
const invoiceRoutes = require('./routes/invoices');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/mowers', mowerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', partsRoutes);
app.use('/api', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
