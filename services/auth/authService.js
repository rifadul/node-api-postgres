import bcrypt from 'bcrypt'
import * as UserModel from '../../models/userModel.js'
import { generateToken } from '../../utils/jwt.js'
import AppError from '../../utils/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'

// REGISTER
export const registerService = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    const normalizedEmail = email.toLowerCase()
    const result = await UserModel.createUser(name, normalizedEmail, hashedPassword)
    const user = result.rows[0]
    return { user }
}

// LOGIN
export const loginService = async (email, password) => {
    const result = await UserModel.findUserByEmail(email)

    if (result.rowCount === 0) {
        throw new AppError('Invalid credentials', 401, ERROR_CODES.UNAUTHORIZED)
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new AppError('Invalid credentials', 401, ERROR_CODES.UNAUTHORIZED)
    }

    const token = generateToken({ id: user.id })

    // ✅ remove password
    delete user.password

    return { user, token }
}