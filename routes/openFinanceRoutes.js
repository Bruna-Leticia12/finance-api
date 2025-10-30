import express from 'express';
const router = express.Router();

import authOpenFinance from '../middlewares/authOpenFinance.js';
import openFinanceController from '../controllers/openFinanceController.js';

router.get('/customers/:id', authOpenFinance.verifyApiKey, openFinanceController.getCustomerData.bind(openFinanceController));
router.get('/customers/:id/accounts', authOpenFinance.verifyApiKey, openFinanceController.getCustomerAccounts.bind(openFinanceController));
router.get('/accounts/:id/balance', authOpenFinance.verifyApiKey, openFinanceController.getAccountBalance.bind(openFinanceController));
router.get('/accounts/:id/transactions', authOpenFinance.verifyApiKey, openFinanceController.getAccountTransactions.bind(openFinanceController));

router.post('/consents', authOpenFinance.verifyApiKey, openFinanceController.createConsent.bind(openFinanceController));
router.get('/consents/:id', authOpenFinance.verifyApiKey, openFinanceController.getConsent.bind(openFinanceController));
router.delete('/consents/:id', authOpenFinance.verifyApiKey, openFinanceController.revokeConsent.bind(openFinanceController));

export default router;