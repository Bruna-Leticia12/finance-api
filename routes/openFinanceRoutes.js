import express from 'express';
const router = express.Router();

import openFinanceController from '../controllers/openFinanceController.js';
import { login } from '../controllers/customerController.js';
import { getCustomerAccounts } from '../controllers/openFinanceController.js';
import { getAccountTransactions } from '../controllers/openFinanceController.js'

router.get('/customers/:id', openFinanceController.getCustomerData.bind(openFinanceController));
router.get('/customers/:id/accounts', getCustomerAccounts);
router.get('/accounts/:id/balance', openFinanceController.getAccountBalance.bind(openFinanceController));
router.get('/accounts/:id/transactions', getAccountTransactions);

router.post('/consents', openFinanceController.createConsent.bind(openFinanceController));
router.get('/consents/:id', openFinanceController.getConsent.bind(openFinanceController));
router.delete('/consents/:id', openFinanceController.revokeConsent.bind(openFinanceController));
router.post('/login', login)

export default router;