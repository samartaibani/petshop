const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validationMiddleware');

router.post('/', verifyToken, validateOrder, createOrder);
router.get('/', verifyToken, getOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);
router.delete('/:id', verifyToken, deleteOrder);

module.exports = router;
