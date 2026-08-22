const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus, updateRequest, deleteRequest, payFee, updateDeliveryStatus } = require('../controllers/adoptionController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', createRequest);
router.get('/', getRequests);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.put('/:id/status', isAdmin, updateStatus);
router.put('/:id/delivery', isAdmin, updateDeliveryStatus);
router.post('/:id/pay', payFee);

module.exports = router;
