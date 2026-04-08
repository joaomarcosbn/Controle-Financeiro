const { db } = require('../config/firebase');

exports.createTransaction = async (req, res) => {
  try {
    // Adicionamos a 'date' aqui na desestruturação
    const { title, amount, type, category, userId, groupId, creditCardId, date } = req.body;

    let referenceMonth = "";
    
    // Se o front-end (ou o script) mandou a data, usamos ela. Se não, usamos HOJE.
    const today = date ? new Date(date) : new Date();
    
    let currentMonth = today.getMonth() + 1; // getMonth() retorna de 0 a 11, então somamos 1
    let currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Se a compra foi feita no Cartão de Crédito, vamos analisar o fechamento!
    if (creditCardId) {
      const cardDoc = await db.collection('credit_cards').doc(creditCardId).get();
      
      if (cardDoc.exists) {
        const cardData = cardDoc.data();
        const closingDay = cardData.closingDay;

        // Se o dia da compra for igual ou maior que o dia de fechamento, joga pro mês que vem
        if (currentDay >= closingDay) {
          currentMonth += 1;
          
          // Se passou de dezembro (12), vira janeiro (1) do ano seguinte
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear += 1;
          }
        }
      }
    }

    // Formata o mês para ficar sempre com 2 dígitos e salva no padrão "MM/YYYY" (Ex: "04/2026")
    referenceMonth = `${String(currentMonth).padStart(2, '0')}/${currentYear}`;

    // Monta a transação final
    const newTransaction = {
      title,
      amount: Number(amount),
      type,
      category,
      userId,
      groupId,
      creditCardId: creditCardId || null,
      date: today, // Usa a data calculada lá em cima
      referenceMonth
    };

    const docRef = await db.collection('transactions').add(newTransaction);
    res.status(201).json({ id: docRef.id, message: 'Transação registrada!', referenceMonth });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação', details: error.message });
  }
};

exports.getGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const snapshot = await db.collection('transactions')
      .where('groupId', '==', groupId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
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

// Buscar transações de um cartão específico
exports.getCardTransactions = async (req, res) => {
  try {
    const { cardId } = req.params;

    const snapshot = await db.collection('transactions')
      .where('creditCardId', '==', cardId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar faturas', details: error.message });
  }
};