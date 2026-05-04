import { ERROR_CODES } from '../constants/errorCodes.js'

const errorHandler = (err, req, res, next) => {
    console.error(err.constraint)

    // PostgreSQL duplicate error
    if (err.code === '23505') {
        switch (err.constraint) {
            case 'users_email_key':
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                    code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
                })

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate resource',
                    code: ERROR_CODES.RESOURCE_ALREADY_EXISTS,
                })
        }
    }

    // Custom errors
    if (err.status) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            code: err.code || ERROR_CODES.GENERIC_ERROR,
        })
    }

    // Fallback
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: ERROR_CODES.INTERNAL_ERROR,
    })
}

export default errorHandler