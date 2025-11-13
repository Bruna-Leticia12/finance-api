import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Account from '../models/Account.js';
import Transaction, { TransactionCategory } from '../models/Transaction.js';
import { ensureIsoDate } from '../utils/validators.js';

export async function createAccountService({ customerId, type, branch, number }) {
  if (!customerId || !type || !branch || !number) {
    throw new Error('customerId, type, branch, and number are required');
  }

  if (!mongoose.isValidObjectId(customerId)) {
    throw new Error('Invalid customerId');
  }

  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error('Customer not found');

  const account = await Account.create({
    type,
    branch: String(branch).trim(),
    number: String(number).trim(),
    balance: 0,
    customer: customer._id
  });

  customer.accounts.push(account._id);
  await customer.save();

  return account;
}

export async function getBalanceService(accountId) {
  if (!mongoose.isValidObjectId(accountId)) {
    throw new Error('Invalid account ID');
  }

  const account = await Account.findById(accountId).lean();
  if (!account) throw new Error('Account not found');

  return account;
}

export async function createTransactionService({ accountId, description, amount, type, category }) {
  if (!mongoose.isValidObjectId(accountId)) {
    throw new Error('Invalid account ID');
  }

  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');

  const isoDate = ensureIsoDate(new Date().toISOString().split('T')[0]);
  if (!isoDate) throw new Error('Invalid date. Use YYYY-MM-DD');

  if (!description || typeof description !== 'string') {
    throw new Error('Description is required');
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount');
  }

  if (!['credit', 'debit'].includes(type)) {
    throw new Error('Type must be credit or debit');
  }

  const validCategories = Object.values(TransactionCategory);
  const normalizedCategory = category?.toUpperCase().trim();

  if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
    throw new Error(`Invalid category. Allowed values: ${validCategories.join(', ')}`);
  }

  if (type === 'debit' && account.balance < parsedAmount) {
    throw new Error('Insufficient balance');
  }

  const newBalance =
    type === 'credit'
      ? account.balance + parsedAmount
      : account.balance - parsedAmount;

  const txn = await Transaction.create({
    date: isoDate,
    description: description.trim(),
    amount: parsedAmount,
    type,
    category: normalizedCategory,
    account: account._id
  });

  account.transactions.push(txn._id);
  account.balance = newBalance;
  await account.save();

  return { txn, balanceAfter: account.balance };
}

export async function listTransactionsService(accountId, { from, to } = {}) {
  if (!mongoose.isValidObjectId(accountId)) {
    throw new Error('Invalid account ID');
  }

  const account = await Account.findById(accountId).lean();
  if (!account) throw new Error('Account not found');

  const filter = { account: account._id };

  if (from || to) {
    filter.date = {};
    if (from) {
      const f = ensureIsoDate(from);
      if (!f) throw new Error('Invalid from parameter');
      filter.date.$gte = f;
    }
    if (to) {
      const t = ensureIsoDate(to);
      if (!t) throw new Error('Invalid to parameter');
      filter.date.$lte = t;
    }
  }

  const txns = await Transaction.find(filter).sort({ date: 1, createdAt: 1 }).lean();

  return { accountId: account._id, count: txns.length, transactions: txns };
}

export async function updateAuthorizationService(accountId, { customerId, bankId, authorize }) {
  if (!mongoose.isValidObjectId(accountId)) {
    throw new Error('Invalid account ID');
  }
  if (!mongoose.isValidObjectId(customerId)) {
    throw new Error('Invalid customerId');
  }
  if (typeof authorize !== 'boolean') {
    throw new Error('authorization must be boolean');
  }

  const account = await Account.findOne({ _id: accountId, customer: customerId, bankId }).exec();
  if (!account) {
    throw new Error('Account not found for this customer/bank');
  }

  account.sharingAllowed = authorize;
  await account.save();
  return account;
}

export async function getAccountDetailsService(accountId) {
  if (!mongoose.isValidObjectId(accountId)) {
    throw new Error('Invalid account ID');
  }

  const account = await Account.findById(accountId).lean();
  if (!account) throw new Error('Account not found');

  if (!account.sharingAllowed) {
    return {
      accountId: account._id,
      branch: account.branch,
      number: account.number,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed
    };
  }

  const Customer = (await import('../models/Customer.js')).default;
  const customer = await Customer.findById(account.customer).lean();

  return {
    accountId: account._id,
    type: account.type,
    branch: account.branch,
    number: account.number,
    bankId: account.bankId,
    sharingAllowed: account.sharingAllowed,
    transactionsCount: Array.isArray(account.transactions)
      ? account.transactions.length
      : 0,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    customer: customer
      ? {
          customerId: customer._id,
          name: customer.name,
          email: customer.email,
          cpf: customer.cpf,
          accounts: customer.accounts || []
        }
      : null
  };
}