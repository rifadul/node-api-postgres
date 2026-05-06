import { verifyAccessToken } from '../utils/jwt.js'
import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken

    if (!token) {
        throw new AppError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED)
    }

    try {
        const decoded = verifyAccessToken(token)
        req.user = decoded
        next()
    } catch (err) {
        throw new AppError('Invalid token', 401, ERROR_CODES.INVALID_TOKEN)
    }
}

export default authMiddleware