const express = require('express');
const router = express.Router();
const { getTransactions, getTransactionStatus } = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');

// All transaction routes are protected
router.use(protect);

router.get('/', getTransactions);
router.get('/school/:schoolId', getTransactions);
router.get('/status/:custom_order_id', getTransactionStatus);

module.exports = router;