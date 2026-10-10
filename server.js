const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { poolPromise } = require('./config/db');
const { ensureTables } = require('./config/ensureTables');

const authRoutes = require('./routes/auth');
const partsRoutes = require('./routes/parts');
const requestsRoutes = require('./routes/requests');
const paymentsRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Security headers via Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Prevent breaking inline styles/fonts for FontAwesome & Google Fonts
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiter for owner login endpoint
const loginRateLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins default
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10), // 10 attempts
    message: {
        success: false,
        error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// CSRF / Same-Site Origin Verification Middleware for State-Changing Auth Requests
app.use('/api/auth', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const origin = req.headers.origin || req.headers.referer;
        const host = req.headers.host;
        if (origin && host) {
            try {
                const url = new URL(origin);
                if (url.host !== host) {
                    return res.status(403).json({
                        success: false,
                        error: 'CSRF security verification failed: origin mismatch.'
                    });
                }
            } catch (e) {
                // Invalid origin format
            }
        }
    }
    next();
});

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth/login', loginRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Explicit Page Fallbacks
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/setup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'setup.html'));
});

app.get('/owner.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'owner.html'));
});

app.get('/spare-parts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'spare-parts.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'setup.html'));
});

app.get('/owner', (req, res) => {
    res.sendFile(path.join(__dirname, 'owner.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Verify SQL Server connection and start server
async function startServer() {
    try {
        console.log('Connecting to SQL Server database...');
        await poolPromise;
        await ensureTables();
    } catch (err) {
        console.error('===========================================================');
        console.error(' ERROR: Could not connect to SQL Server!');
        console.error(' Server will NOT start because SQL Server is unreachable.');
        console.error('===========================================================');
        process.exit(1);
    }

    app.listen(PORT, HOST, () => {
        console.log(`===========================================================`);
        console.log(` SAI SRINIVASA AUTOMOBILES EXPRESS SERVER IS RUNNING`);
        console.log(` Listening on : http://${HOST}:${PORT}`);
        console.log(` Local URL    : http://localhost:${PORT}`);
        console.log(` Public Home  : http://localhost:${PORT}/index.html`);
        console.log(` Owner Setup  : http://localhost:${PORT}/setup.html`);
        console.log(` Owner Login  : http://localhost:${PORT}/login.html`);
        console.log(` Owner Console: http://localhost:${PORT}/owner.html`);
        console.log(`===========================================================`);
    });
}

startServer();
