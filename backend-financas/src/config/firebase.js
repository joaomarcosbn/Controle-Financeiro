const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-key.json'); // O arquivo que você baixou

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { admin, db };