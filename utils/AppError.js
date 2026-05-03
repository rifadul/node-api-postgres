import { ERROR_CODES } from '../constants/errorCodes.js'

class AppError extends Error {
    constructor(message, status = 500, code = ERROR_CODES.INTERNAL_ERROR) {
        super(message)

        this.status = status
        this.code = code

        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError