import express from 'express';
const router = express.Router();

import openFinanceController from '../controllers/openFinanceController.js';
import { login } from '../controllers/customerController.js';

router.get('/customers/:id', openFinanceController.getCustomerData.bind(openFinanceController));
router.get('/customers/:id/accounts', openFinanceController.getCustomerAccounts.bind(openFinanceController));
router.get('/accounts/:id/balance', openFinanceController.getAccountBalance.bind(openFinanceController));
router.get('/accounts/:id/transactions', openFinanceController.getAccountTransactions.bind(openFinanceController));

router.post('/consents', openFinanceController.createConsent.bind(openFinanceController));
router.get('/consents/:id', openFinanceController.getConsent.bind(openFinanceController));
router.delete('/consents/:id', openFinanceController.revokeConsent.bind(openFinanceController));
router.post('/login', login)

export default router;