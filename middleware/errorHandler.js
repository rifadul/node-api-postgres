const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    // PostgreSQL duplicate error
    if (err.code === '23505') {
        return res.status(400).json({
            message: 'Email already exists',
        })
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    })
}

export default errorHandler