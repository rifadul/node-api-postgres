const validate = (schema) => {
    return (req, res, next) => {
        try {
            // parse will validate and throw if invalid
            req.body = schema.parse(req.body)

            next()
        } catch (error) {
            return res.status(400).json({
                message: error.errors?.[0]?.message || 'Validation error',
            })
        }
    }
}

export default validate