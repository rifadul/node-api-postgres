import express from 'express'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import apiKeyMiddleware from './middleware/apiKey.js'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '10kb' }))
app.use(cors())
app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use(apiKeyMiddleware)
app.use(limiter)
app.use('/users', userRoutes)
app.use('/auth', authRoutes)


// ✅ global error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})