const { db } = require('../config/firebase');

exports.createCard = async (req, res) => {
  try {
    const { name, closingDay, dueDay, groupId } = req.body;

    const newCard = {
      name,         // Ex: "Nubank Marcelle"
      closingDay: Number(closingDay), // Dia que a fatura fecha (Ex: 25)
      dueDay: Number(dueDay),         // Dia que a fatura vence (Ex: 05)
      groupId,      // Vinculado ao grupo da família
      createdAt: new Date()
    };

    const docRef = await db.collection('credit_cards').add(newCard);
    res.status(201).json({ id: docRef.id, message: 'Cartão cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar cartão' });
  }
};

exports.getGroupCards = async (req, res) => {
  try {
    const { groupId } = req.params;
    const snapshot = await db.collection('credit_cards').where('groupId', '==', groupId).get();
    
    if (snapshot.empty) return res.status(200).json([]);

    const cards = [];
    snapshot.forEach(doc => cards.push({ id: doc.id, ...doc.data() }));
    
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cartões' });
  }
};