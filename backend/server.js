const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const functions = require('firebase-functions');
const { initializeApp, cert, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('./utils/logger');
const { sanitizeInputs } = require('./middleware/validationMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Cloudflare, GCP Functions, NGINX)
app.set('trust proxy', 1);

// Obscure Express framework identification header
app.disable('x-powered-by');

// 1. Security Headers (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://firestore.googleapis.com"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000, // 1 year HSTS
        includeSubDomains: true,
        preload: true
    }
}));

// 2. CORS Whitelisting
const defaultAllowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'https://petfoodshop-fean.web.app',
    'https://petfoodshop-fean.firebaseapp.com'
];
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(null, true); // Allow during transition if needed, or set to error in strict production
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Keep-Alive Health Endpoint (for UptimeRobot / Render monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

// 3. Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Max 10 authentication attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// Apply global rate limiter to all /api/ endpoints
app.use('/api/', globalLimiter);

// 4. Payload Size Limits & XSS Sanitization
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(sanitizeInputs);

// Static uploads serving with cross-origin security headers
app.use('/uploads', express.static('uploads', {
    setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('Content-Disposition', 'inline');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// 5. Firebase Setup (Environment Variable or ServiceAccountKey Fallback)
let db;
try {
    let adminApp;
    try {
        adminApp = getApp();
    } catch (e) {
        let credentialObj;
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            credentialObj = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            credentialObj = cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            });
        } else {
            const serviceAccount = require('./serviceAccountKey.json');
            credentialObj = cert(serviceAccount);
        }

        adminApp = initializeApp({
            credential: credentialObj
        });
    }
    db = getFirestore();
    logger.info('Firebase Admin SDK Initialized Successfully');
} catch (error) {
    logger.error('Firebase Config Error', { error: error.message });
}

// Health Check Route
app.get('/', (req, res) => {
    res.json({ status: 'healthy', service: 'Pet Food Shop API' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const ratingRoutes = require('./routes/rating.routes');
const statsRoutes = require('./routes/stats.routes');
const contactRoutes = require('./routes/contact.routes');
const adoptionRoutes = require('./routes/adoption.routes');
const adoptionFormRoutes = require('./routes/adoptionForm.routes');
const subCategoryRoutes = require('./routes/subcategory.routes');

// Use Routes (with specific auth rate limiter on /api/auth)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/adoption-forms', adoptionFormRoutes);

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled Error encountered', {
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        path: req.originalUrl
    });
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Only start local server if not running inside Cloud Functions emulator/runtime
if (!process.env.FUNCTION_NAME && !process.env.FUNCTIONS_EMULATOR) {
    app.listen(PORT, () => {
        logger.info(`Server running securely on port ${PORT}`);
    });
}

exports.api = functions.https.onRequest(app);
module.exports = { db };
