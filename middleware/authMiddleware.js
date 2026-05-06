import { verifyAccessToken } from '../utils/jwt.js'
import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED)
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = verifyAccessToken(token)
        req.user = decoded
        next()
    } catch (err) {
        throw new AppError('Invalid token', 401, ERROR_CODES.INVALID_TOKEN)
    }
}

export default authMiddleware