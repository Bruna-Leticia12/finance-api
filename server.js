const express = require('express');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

app.use(express.json());

app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

module.exports = app;