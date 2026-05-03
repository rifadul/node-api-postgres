import formatZodError from '../utils/formatZodError.js'
import { ZodError } from 'zod'

const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            })

            // ✅ store validated data safely
            // ✅ merge instead of overwrite
            req.validated = {
                ...req.validated,
                ...validatedData,
            }

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    errors: formatZodError(error),
                })
            }

            next(error)
        }
    }
}

export default validate