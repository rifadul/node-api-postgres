import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

const authorizeSelf = (req, res, next) => {
    const loggedInUserId = req.user.id
    const requestedUserId = Number(req.params.id)

    if (loggedInUserId !== requestedUserId) {
        throw new AppError(
            'You are not allowed to perform this action',
            403,
            ERROR_CODES.FORBIDDEN
        )
    }

    next()
}

export default authorizeSelf