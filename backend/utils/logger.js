const winston = require('winston');

// Sensitive field keys to redact from logs
const SENSITIVE_KEYS = ['password', 'token', 'idtoken', 'secret', 'authorization', 'creditcard', 'cvv'];

// Recursive function to redact sensitive fields in objects
function redactSensitiveData(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(redactSensitiveData);

    const redacted = {};
    for (const key of Object.keys(obj)) {
        if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
            redacted[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            redacted[key] = redactSensitiveData(obj[key]);
        } else {
            redacted[key] = obj[key];
        }
    }
    return redacted;
}

// Create Winston logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    defaultMeta: { service: 'pet-shop-backend' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const cleanMeta = Object.keys(meta).length ? JSON.stringify(redactSensitiveData(meta)) : '';
                    return `[${timestamp}] ${level}: ${message} ${cleanMeta}`;
                })
            )
        })
    ]
});

module.exports = {
    logger,
    redactSensitiveData
};
