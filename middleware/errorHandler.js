import { ERROR_CODES } from "../constants/errorCodes.js";

const errorHandler = (err, req, res, next) => {
    console.error(err)

    // PostgreSQL duplicate error
    if (err.code === '23505') {
        return res.status(400).json({
            message: 'Request failed',
            code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        })
    }

    // Our custom errors
    if (err.status && err.code) {
        return res.status(err.status).json({
            message: err.message,
            code: err.code,
        })
    }

    // Fallback
    return res.status(500).json({
        message: 'Internal server error',
        code: ERROR_CODES.INTERNAL_ERROR,
    })
}

export default errorHandler