const apiKeyMiddleware = (req, res, next) => {
    // ✅ allow auth routes
    if (req.path.startsWith('/auth')) {
        return next()
    }

    const key = req.headers['x-api-key']

    if (key !== process.env.API_KEY) {
        return res.status(403).json({ message: 'Forbidden' })
    }

    next()
}

export default apiKeyMiddleware