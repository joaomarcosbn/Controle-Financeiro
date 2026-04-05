const { db } = require('../config/firebase');

// Criar uma nova despesa ou receita
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, userId, groupId, creditCardId } = req.body;

    const newTransaction = {
      title,
      amount: Number(amount), // Garante que seja salvo como número
      type, // 'INCOME' ou 'EXPENSE'
      category,
      userId,
      groupId, 
      creditCardId: creditCardId || null,
      date: new Date(), 
    };

    const docRef = await db.collection('transactions').add(newTransaction);
    res.status(201).json({ id: docRef.id, message: 'Transação registrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação', details: error.message });
  }
};

// Buscar todas as transações de um Grupo Familiar
exports.getGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params; // Pegamos o ID do grupo pela URL

    const snapshot = await db.collection('transactions')
      .where('groupId', '==', groupId)
      // .orderBy('date', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // Retorna array vazio se não tiver gastos
    }

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações', details: error.message });
  }
};