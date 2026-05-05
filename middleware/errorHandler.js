import { ERROR_CODES } from '../constants/errorCodes.js'
import { errorResponse } from '../utils/response.js'

const errorHandler = (err, req, res, next) => {
    console.error(err)

    // PostgreSQL unique violation
    if (err.code === '23505') {
        if (err.constraint === 'users_email_unique_active') {
            return errorResponse(res, {
                status: 400,
                message: 'Email already exists',
                code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
            })
        }

        return errorResponse(res, {
            status: 400,
            message: 'Duplicate resource',
            code: ERROR_CODES.RESOURCE_ALREADY_EXISTS,
        })
    }

    // Custom errors
    if (err.status) {
        return errorResponse(res, {
            status: err.status,
            message: err.message,
            code: err.code || ERROR_CODES.INTERNAL_ERROR,
        })
    }

    // Fallback
    return errorResponse(res, {
        status: 500,
        message: 'Internal server error',
        code: ERROR_CODES.INTERNAL_ERROR,
    })
}

export default errorHandler