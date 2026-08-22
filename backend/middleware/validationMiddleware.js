const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss-clean');

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation Error",
            details: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// XSS Sanitizer Middleware for request body, query, and params
const sanitizeInputs = xss();

// Registration Validation Rules
const validateRegister = [
    body('email')
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    handleValidationErrors
];

// Login Validation Rules
const validateLogin = [
    body('idToken')
        .notEmpty().withMessage('Firebase ID Token is required'),
    handleValidationErrors
];

// Product Validation Rules
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 150 }).withMessage('Product name must not exceed 150 characters'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    handleValidationErrors
];

// Order Validation Rules
const validateOrder = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId')
        .notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('address')
        .trim()
        .notEmpty().withMessage('Shipping address is required'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Contact phone number is required'),
    handleValidationErrors
];

module.exports = {
    sanitizeInputs,
    validateRegister,
    validateLogin,
    validateProduct,
    validateOrder,
    handleValidationErrors
};
