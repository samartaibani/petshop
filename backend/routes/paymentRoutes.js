const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Approximating middleware names

// Admin: Get all payments
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);

// User: Get my payments
router.get('/my', verifyToken, paymentController.getMyPayments);

module.exports = router;
