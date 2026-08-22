const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

// Base route is /api/wishlist
router.post('/', verifyToken, wishlistController.addToWishlist);
router.get('/', verifyToken, wishlistController.getWishlist);
router.delete('/:productId', verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
