import express from 'express'
import userRoutes from './routes/userRoutes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())
app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use('/users', userRoutes)


// ✅ global error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})