const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Post a rating (Requires login)
router.post('/', verifyToken, ratingController.addRating);

// Get ratings for a specific product (Public)
router.get('/:productId', ratingController.getProductRatings);

module.exports = router;
