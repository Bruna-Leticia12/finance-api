import 'dotenv/config';
import express from 'express';
import customerRoutes from './routes/customerRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import openFinanceRoutes from './routes/openFinanceRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import cors from 'cors';

import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/open-finance', openFinanceRoutes);
app.use('/consents', consentRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found.' });
});

app.use(errorHandler);

export default app;