const { db } = require('../config/firebase');

exports.createUser = async (req, res) => {
  try {
    const { uid, name, email } = req.body; // O uid virá do login do Firebase no Front-end

    // 1. Cria um novo grupo para esse usuário (A "Casa")
    const groupRef = await db.collection('family_groups').add({
      name: `Grupo de ${name}`,
      members: [uid],
      createdAt: new Date()
    });

    // 2. Salva o usuário já vinculado a esse grupo
    const newUser = {
      name,
      email,
      groupId: groupRef.id,
      createdAt: new Date()
    };

    await db.collection('users').doc(uid).set(newUser);

    res.status(201).json({ message: 'Usuário e grupo criados com sucesso!', groupId: groupRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
};