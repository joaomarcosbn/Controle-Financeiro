const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.post('/', cardController.createCard);
router.get('/group/:groupId', cardController.getGroupCards);

module.exports = router;