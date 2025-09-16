const {
  createAccountService,
  getBalanceService,
  createTransactionService,
  listTransactionsService,
  updateAuthorizationService,
  getAccountDetailsService
} = require('../services/accountService');

async function createAccount(req, res) {
  try {
    const account = await createAccountService(req.body);
    return res.status(201).json(account);
  } catch (err) {
    console.error('Erro em createAccount:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function getBalance(req, res) {
  try {
    const account = await getBalanceService(req.params.id);
    return res.json({
      accountId: account._id,
      branch: account.branch,
      number: account.number,
      balance: account.balance,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed
    });
  } catch (err) {
    console.error('Erro em getBalance:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function createTransaction(req, res) {
  try {
    const result = await createTransactionService(req.params.id, req.body);
    return res.status(201).json({
      transaction: result.txn,
      balanceAfter: result.balanceAfter
    });
  } catch (err) {
    console.error('Erro em createTransaction:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function listTransactions(req, res) {
  try {
    const result = await listTransactionsService(req.params.id, req.query);
    return res.json(result);
  } catch (err) {
    console.error('Erro em listTransactions:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function updateAuthorization(req, res) {
  try {
    const account = await updateAuthorizationService(req.params.id, req.body);
    return res.json({
      accountId: account._id,
      bankId: account.bankId,
      sharingAllowed: account.sharingAllowed
    });
  } catch (err) {
    console.error('Erro em updateAuthorization:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

async function getAccountDetails(req, res) {
  try {
    const result = await getAccountDetailsService(req.params.id);
    return res.json(result);
  } catch (err) {
    console.error('Erro em getAccountDetails:', err.message);
    return res.status(400).json({ error: err.message });
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