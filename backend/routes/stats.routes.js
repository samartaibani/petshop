const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get public statistics
router.get('/', statsController.getPublicStats);

module.exports = router;
