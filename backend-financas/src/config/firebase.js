const admin = require('firebase-admin');

let serviceAccount;

// Verifica se está rodando no Render (produção) ou no seu PC (desenvolvimento)
if (process.env.FIREBASE_CREDENTIALS) {
  // Em produção, ele lê do "cofre" do Render e transforma em objeto
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
  // No seu PC, ele continua lendo o arquivo físico normalmente
  serviceAccount = require('../../firebase-key.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { admin, db };