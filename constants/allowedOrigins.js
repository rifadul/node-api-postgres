const isProduction = process.env.NODE_ENV === 'production';

export const allowedOrigins = isProduction
    ? ['https://node-api-postgres-zbuq.onrender.com']
    : ['http://localhost:3000', 'http://localhost:5173'];