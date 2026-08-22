const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('../utils/logger');

// Verify Token and Attach User to Request
exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        logger.warn('Authentication failure: No token provided', { ip: req.ip, path: req.originalUrl });
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        req.user = decodedToken;

        // Fetch User Role from Firestore
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (userDoc.exists) {
            req.user.role = userDoc.data().role;
        }

        next();
    } catch (error) {
        logger.warn('Authentication failure: Invalid token', { ip: req.ip, error: error.message });
        res.status(403).json({ error: "Invalid or expired authentication token" });
    }
};

// Admin Only Guard
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 1) {
        next();
    } else {
        logger.warn('Authorization failure: Admin access required', { uid: req.user?.uid, ip: req.ip, path: req.originalUrl });
        res.status(403).json({ error: "Forbidden. Admin access required." });
    }
};

// Verify Resource Ownership or Admin Rights
exports.verifyOwnerOrAdmin = (getParamUid) => {
    return (req, res, next) => {
        const resourceUid = typeof getParamUid === 'function' ? getParamUid(req) : req.params[getParamUid || 'userId'];
        
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (req.user.role === 1 || req.user.uid === resourceUid) {
            return next();
        }

        logger.warn('Authorization failure: User attempted unauthorized access to resource', {
            requestorUid: req.user.uid,
            targetUid: resourceUid,
            path: req.originalUrl
        });

        return res.status(403).json({ error: "Forbidden. You do not have permission to access this resource." });
    };
};
