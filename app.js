import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import apiKeyMiddleware from './middleware/apiKey.js';
import { allowedOrigins } from './constants/allowedOrigins.js';

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.'
});

const csrfProtection = csrf({
    cookie: true,
});

// ✅ CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ✅ Correct order
app.use(cookieParser());      // 🔥 FIRST
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ CSRF (conditional)
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
    }
    return csrfProtection(req, res, next)
})

app.use(limiter);
app.use(apiKeyMiddleware);

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});