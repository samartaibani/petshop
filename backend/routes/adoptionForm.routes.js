const express = require('express');
const router = express.Router();
const { getForm, saveForm, updateForm, deleteForm } = require('../controllers/adoptionFormController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getForm);
router.post('/', saveForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

module.exports = router;
