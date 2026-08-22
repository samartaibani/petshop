const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAddresses, getAllUsers, deleteUser, changePassword } = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('profileImage'), updateProfile);
router.put('/addresses', verifyToken, updateAddresses);
router.post('/change-password', verifyToken, changePassword);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;
