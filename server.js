const express = require('express');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');

const app = express();

app.use(express.json());

app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionsRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

module.exports = app;