const express = require('express');
const mongoose = require('mongoose');

const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

// middlewares
app.use(express.json()); // faz o parse de JSON no body

// health check simples
//app.get('/health', (req, res) => res.json({ status: 'ok' }));

// rotas da API
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);

// rota 404 para não encontradas
app.use((req, res) => {
  return res.status(404).json({ error: 'Rota não encontrada' });
});

// inicia conexão com MongoDB e sobe servidor
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance_api';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });