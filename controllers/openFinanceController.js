import Customer from '../models/Customer.js';
import Account from '../models/Account.js';
import Consent from '../models/Consent.js';

class OpenFinanceController {

  // GET /openfinance/customers/:id
  async getCustomerData(req, res, next) {
    try {
      const customer = await Customer.findById(req.params.id).select('-password');
      if (!customer)
        return res.status(404).json({ message: 'Customer not found' });

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  // GET /openfinance/customers/:id/accounts
  async getCustomerAccounts(req, res, next) {
    try {
      const accounts = await Account.find({ customer: req.params.id })
        .populate('customer', 'name');

      if (!accounts.length)
        return res.status(404).json({ message: 'No accounts found for this customer' });

      res.json(accounts);
    } catch (error) {
      next(error);
    }
  }

  // GET /openfinance/accounts/:id/balance
  async getAccountBalance(req, res, next) {
    try {
      const account = await Account.findById(req.params.id);
      if (!account)
        return res.status(404).json({ message: 'Account not found' });

      res.json({
        accountId: account._id,
        balance: account.balance
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /openfinance/accounts/:id/transactions
  async getAccountTransactions(req, res, next) {
    try {
      const account = await Account.findById(req.params.id)
        .populate('transactions');

      if (!account)
        return res.status(404).json({ message: 'Account not found' });

      res.json(account.transactions);
    } catch (error) {
      next(error);
    }
  }

  // POST /openfinance/consents
  async createConsent(req, res, next) {
    try {
      const { customer, permissions, expirationDateTime } = req.body;
      const apiKey = Math.random().toString(36).substring(2, 15);

      const consent = await Consent.create({
        customer,
        permissions,
        expirationDateTime,
        apiKey,
        plainApiKey: apiKey // Apenas teste
      });

      res.status(201).json(consent);
    } catch (error) {
      next(error);
    }
  }

  // GET /openfinance/consents/:id
  async getConsent(req, res, next) {
    try {
      const consent = await Consent.findById(req.params.id);
      if (!consent)
        return res.status(404).json({ message: 'Consent not found' });

      res.json(consent);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /openfinance/consents/:id
  async revokeConsent(req, res, next) {
    try {
      const consent = await Consent.findById(req.params.id);

      if (!consent)
        return res.status(404).json({ message: 'Consent not found' });

      consent.status = 'REVOKED';
      await consent.save();

      res.json({
        message: 'Consent successfully revoked',
        consent
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OpenFinanceController();