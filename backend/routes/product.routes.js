const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
// In a real app, strict Admin checks here. For demo, we allow simple access or mixed.
// But as per req "Admin side features", these should be protected.
// I'll add basic protection if possible, or leave open for easiest testing if Auth token handling is complex.
// The user wants "Protected by role".
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, isAdmin, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
