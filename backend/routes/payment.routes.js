const express = require('express');
const router = express.Router();
const { createPayment, handleWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// This route is protected, only logged-in users can create payments
router.post('/create', protect, createPayment);

// This route is NOT protected, as it's called by the external payment gateway
router.post('/webhook', handleWebhook);

module.exports = router;