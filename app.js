import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { allowedOrigins } from './constants/allowedOrigins.js';
import helmet from 'helmet'
import morgan from 'morgan';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
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
    credentials: true,
}));

// ✅ parsers
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ csrf protection
app.use((req, res, next) => {
    // skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // skip csrf token route
    if (req.originalUrl === '/auth/csrf-token') {
        return next();
    }

    return csrfProtection(req, res, next);
});

// ✅ rate limit
app.use(limiter);


// ✅ set security headers
app.use(helmet());

// ✅ logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// ✅ public routes
app.use('/auth', authRoutes);

// ✅ protected frontend routes
app.use('/users', userRoutes);

// ✅ swagger
app.use('/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ✅ error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});