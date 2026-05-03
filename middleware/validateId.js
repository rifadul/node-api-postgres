const validateId = (req, res, next) => {
    const id = Number(req.params.id)

    if (!id || isNaN(id)) {
        return res.status(400).json({
            message: 'Invalid user ID',
        })
    }

    req.userId = id
    next()
}

export default validateId