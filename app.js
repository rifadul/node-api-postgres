import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import apiKeyMiddleware from './middleware/apiKey.js';
import { allowedOrigins } from './constants/allowedOrigins.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable this ONLY when you deploy to a platform like Heroku or use Nginx
// app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.'
});

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

app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(apiKeyMiddleware);

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});