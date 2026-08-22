const express = require('express');
const router = express.Router();
const { getAllSubCategories, createSubCategory, updateSubCategory, deleteSubCategory } = require('../controllers/subcategoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllSubCategories);
router.post('/', verifyToken, isAdmin, createSubCategory);
router.put('/:id', verifyToken, isAdmin, updateSubCategory);
router.delete('/:id', verifyToken, isAdmin, deleteSubCategory);

module.exports = router;
