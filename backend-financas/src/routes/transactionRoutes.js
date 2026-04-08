const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.createTransaction);
router.get('/group/:groupId', transactionController.getGroupTransactions);
router.get('/card/:cardId', transactionController.getCardTransactions);

module.exports = router;