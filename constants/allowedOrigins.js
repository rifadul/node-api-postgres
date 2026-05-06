const isProduction = process.env.NODE_ENV === 'production';

export const allowedOrigins = isProduction
    ? ['https://your-app-name.netlify.app', 'https://api.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'];