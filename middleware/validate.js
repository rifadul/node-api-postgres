import { ZodError } from 'zod'
import formatZodError from '../utils/formatZodError.js'
import { errorResponse } from '../utils/response.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            })

            req.validated = {
                ...req.validated,
                ...validatedData,
            }

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return errorResponse(res, {
                    status: 400,
                    message: 'Validation failed',
                    code: ERROR_CODES.VALIDATION_ERROR,
                    errors: formatZodError(error),
                })
            }

            next(error)
        }
    }
}

export default validate