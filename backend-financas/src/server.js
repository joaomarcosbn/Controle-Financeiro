const express = require('express');
const cors = require('cors');
const cardRoutes = require('./routes/cardRoutes');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/cards', cardRoutes);

// Importação das rotas
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Uso das rotas
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});