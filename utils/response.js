export const successResponse = (res, options = {}) => {
    const {
        status = 200,
        message = 'Success',
        data = null,
        meta = null,
    } = options

    return res.status(status).json({
        success: true,
        message,
        data,
        ...(meta && { meta }),
    })
}

export const errorResponse = (res, options = {}) => {
    const {
        status = 500,
        message = 'Something went wrong',
        code = 'INTERNAL_ERROR',
        errors = null,
    } = options

    return res.status(status).json({
        success: false,
        message,
        code,
        ...(errors && { errors }),
    })
}