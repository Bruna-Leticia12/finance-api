const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { ensureIsoDate } = require('../utils/validators');

/**
 * POST /api/accounts
 * body: { customerId, type, branch, number, initialBalance? }
 */
async function createAccount(req, res) {
  try {
    const { customerId, type, branch, number, initialBalance } = req.body;

    // Validação básica de presença
    if (!customerId || !type || !branch || !number) {
      return res.status(400).json({ error: 'customerId, type, branch e number são obrigatórios' });
    }

    // Valida formato do ObjectId do customerId
    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ error: 'customerId inválido' });
    }

    // Buscar cliente
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });

    // Tratar initialBalance: aceitar número ou string numérica
    let balance = 0;
    if (initialBalance !== undefined) {
      const parsed = Number(initialBalance);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return res.status(400).json({ error: 'initialBalance deve ser um número >= 0' });
      }
      balance = parsed;
    }

    // Criar a conta (normaliza branch/number)
    const account = await Account.create({
      type,
      branch: String(branch).trim(),
      number: String(number).trim(),
      balance,
      customer: customer._id
    });

    // Vincula a conta ao cliente
    customer.accounts.push(account._id);
    await customer.save();

    return res.status(201).json(account);
  } catch (err) {
    // duplicidade índice (branch + number)
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Já existe uma conta com essa agência e número' });
    }
    console.error('Erro em createAccount:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta' });
  }
}

/**
 * GET /api/accounts/:id/balance
 */
async function getBalance(req, res) {
  try {
    const { id } = req.params;

    // valida id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID da conta inválido' });
    }

    const account = await Account.findById(id).lean();
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' });

    return res.json({
      accountId: account._id,
      branch: account.branch,
      number: account.number,
      balance: account.balance
    });
  } catch (err) {
    console.error('Erro em getBalance:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar saldo' });
  }
}

/**
 * POST /api/accounts/:id/transactions
 * body: { date(YYYY-MM-DD), description, amount, type(credit|debit), category? }
 */
async function createTransaction(req, res) {
  try {
    const { id } = req.params;
    const { date, description, amount, type, category } = req.body;

    // valida id da conta
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID da conta inválido' });
    }

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' });

    // valida data (usa ensureIsoDate)
    const isoDate = ensureIsoDate(date);
    if (!isoDate) return res.status(400).json({ error: 'Data inválida. Use YYYY-MM-DD' });

    // descrição
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    // aceita amount como número ou string numérica
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'Valor (amount) deve ser número >= 0' });
    }

    // tipo válido
    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser "credit" ou "debit"' });
    }

    // regra de negócio: não permitir saldo negativo (checagem com parsedAmount)
    if (type === 'debit' && account.balance < parsedAmount) {
      return res.status(400).json({ error: 'Saldo insuficiente para débito' });
    }

    // calcula novo saldo
    const newBalance = type === 'credit'
      ? account.balance + parsedAmount
      : account.balance - parsedAmount;

    // cria transação
    const txn = await Transaction.create({
      date: isoDate,
      description: description.trim(),
      amount: parsedAmount,
      type,
      category: category ? String(category).trim() : undefined,
      account: account._id
    });

    // vincula a transação e salva conta
    account.transactions.push(txn._id);
    account.balance = newBalance;
    await account.save();

    return res.status(201).json({
      transaction: txn,
      balanceAfter: account.balance
    });
  } catch (err) {
    console.error('Erro em createTransaction:', err);
    return res.status(500).json({ error: 'Erro interno ao criar transação' });
  }
}

/**
 * GET /api/accounts/:id/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
async function listTransactions(req, res) {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    // valida id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID da conta inválido' });
    }

    const account = await Account.findById(id).lean();
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' });

    const filter = { account: account._id };

    // valida e aplica from/to (se forem informados)
    if (from || to) {
      filter.date = {};
      if (from) {
        const f = ensureIsoDate(from);
        if (!f) return res.status(400).json({ error: 'Parâmetro from inválido. Use YYYY-MM-DD' });
        filter.date.$gte = f;
      }
      if (to) {
        const t = ensureIsoDate(to);
        if (!t) return res.status(400).json({ error: 'Parâmetro to inválido. Use YYYY-MM-DD' });
        filter.date.$lte = t;
      }
    }

    const txns = await Transaction.find(filter).sort({ date: 1, createdAt: 1 }).lean();

    return res.json({
      accountId: account._id,
      count: txns.length,
      transactions: txns
    });
  } catch (err) {
    console.error('Erro em listTransactions:', err);
    return res.status(500).json({ error: 'Erro interno ao listar transações' });
  }
}

module.exports = {
  createAccount,
  getBalance,
  createTransaction,
  listTransactions
};