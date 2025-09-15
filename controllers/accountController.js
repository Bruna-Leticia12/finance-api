const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { ensureIsoDate } = require('../utils/validators');

/**
 * POST /api/accounts
 * body: { customerId, type, branch, number, initialBalance?, bankId, sharingAllowed }
 */
async function createAccount(req, res) {
  try {
    const { customerId, type, branch, number, initialBalance, bankId, sharingAllowed } = req.body;

    // Validação básica de presença
    if (!customerId || !type || !branch || !number || !bankId) {
      return res.status(400).json({ error: 'customerId, type, branch, number e bankId são obrigatórios' });
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
      bankId: String(bankId).trim(),
      sharingAllowed: typeof sharingAllowed === 'boolean' ? sharingAllowed : true,
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
      balance: account.balance,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed
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

/**
 * PATCH /api/accounts/:id/authorization
 * body: { customerId, bankId, authorize }
 */
async function updateAuthorization(req, res) {
  try {
    const { id } = req.params;
    const { customerId, bankId, authorize } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID da conta inválido' });
    }
    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ error: 'customerId inválido' });
    }
    if (typeof authorize !== 'boolean') {
      return res.status(400).json({ error: 'authorize deve ser boolean' });
    }

    const account = await Account.findOne({ _id: id, customer: customerId, bankId }).exec();
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada para este cliente/banco' });
    }

    account.sharingAllowed = authorize;
    await account.save();

    return res.json({
      accountId: account._id,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed
    });
  } catch (err) {
    console.error('Erro em updateAuthorization:', err);
    return res.status(500).json({ error: 'Erro interno ao atualizar autorização' });
  }
}

/**
 * GET /api/accounts/:id
 * Retorna os dados da conta e, se sharingAllowed === true, os dados do customer.
 */
async function getAccountDetails(req, res) {
  try {
    const { id } = req.params;

    // Valida id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID da conta inválido' });
    }

    // Busca a conta
    const account = await Account.findById(id).lean();
    if (!account) return res.status(404).json({ error: 'Conta não encontrada' });

    // Se não compartilha, retorna apenas informações mínimas
    if (!account.sharingAllowed) {
      return res.json({
        accountId: account._id,
        branch: account.branch,
        number: account.number,
        bankId: account.bankId,
        sharingAllowed: account.sharingAllowed
      });
    }

    // Se compartilha, monta resposta completa
    const response = {
      accountId: account._id,
      type: account.type,
      branch: account.branch,
      number: account.number,
      balance: account.balance,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed,
      transactionsCount: Array.isArray(account.transactions) ? account.transactions.length : 0,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    // Busca dados do customer (somente se autorizado)
    const customer = await Customer.findById(account.customer).lean();
    if (customer) {
      response.customer = {
        customerId: customer._id,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf,
        accounts: customer.accounts || []
      };
    } else {
      response.customer = null;
    }

    return res.json(response);
  } catch (err) {
    console.error('Erro em getAccountDetails:', err);
    return res.status(500).json({ error: 'Erro interno ao obter detalhes da conta' });
  }
}

module.exports = {
  createAccount,
  getBalance,
  createTransaction,
  listTransactions,
  updateAuthorization,
  getAccountDetails
};
