import bcrypt from 'bcrypt'
import * as UserModel from '../../models/userModel.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js'
import AppError from '../../utils/AppError.js'
import { ERROR_CODES } from '../../constants/errorCodes.js'
import { generateResetToken } from '../../utils/resetToken.js'
import { createHash, randomBytes } from 'crypto'
import { AUDIT_ACTIONS } from '../../constants/auditActions.js'
import { logAction } from '../auditLogService.js'
import { hashToken } from '../../utils/hash.js'

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

    await logAction({
        actorId: user.id,
        action: AUDIT_ACTIONS.LOGIN,
        entityType: 'users',
        entityId: user.id,
        metadata: {
            name: user.name,
            email: user.email,
        },
    })

    const accessToken = generateAccessToken({ id: user.id })
    const refreshToken = generateRefreshToken({ id: user.id })

    // 🔥 HASH before saving
    const hashedToken = hashToken(refreshToken)

    await UserModel.saveRefreshToken(user.id, hashedToken)

    // ✅ remove password
    delete user.password

    return {
        user,
        accessToken,
        refreshToken,
    }
}

export const changePasswordService = async (userId, currentPassword, newPassword) => {
    const result = await UserModel.findUserByIdWithPassword(userId)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404)
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
        throw new AppError('Current password is incorrect', 400, ERROR_CODES.VALIDATION_ERROR)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await UserModel.updatePassword(userId, hashedPassword)

    return true
}


export const forgotPasswordService = async (email) => {
    const result = await UserModel.findUserByEmail(email)

    // ❗ don't reveal if email exists
    if (result.rowCount === 0) {
        return true
    }

    const { rawToken, hashedToken } = generateResetToken()

    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    await UserModel.saveResetToken(email, hashedToken, expires)

    // 🔥 simulate email
    console.log(`Reset link: http://localhost:3000/reset-password?token=${rawToken}`)

    return true
}


export const resetPasswordService = async (token, newPassword) => {
    const hashedToken = createHash('sha256')
        .update(token)
        .digest('hex')




    const result = await UserModel.findByResetToken(hashedToken)

    if (result.rowCount === 0) {
        throw new AppError('Invalid or expired token', 400, ERROR_CODES.TOKEN_EXPIRED)
    }

    const user = result.rows[0]

    if (new Date(user.reset_token_expires) < new Date()) {
        throw new AppError('Token expired', 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await UserModel.updatePasswordAndClearToken(
        user.id,
        hashedPassword
    )

    return true
}


export const refreshTokenService = async (oldRefreshToken) => {
    if (!oldRefreshToken) {
        throw new AppError('Refresh token required', 401, ERROR_CODES.INVALID_REQUEST)
    }

    let decoded
    try {
        decoded = verifyRefreshToken(oldRefreshToken)
    } catch {
        throw new AppError('Invalid refresh token', 401, ERROR_CODES.INVALID_TOKEN)
    }

    // 🔥 HASH incoming token before DB lookup
    const hashedOldToken = hashToken(oldRefreshToken)

    const result = await UserModel.findUserByRefreshToken(
        hashedOldToken
    )

    if (result.rowCount === 0) {
        // 🔥 optional: kill all sessions (simple version = clear current user by decoded.id)
        await UserModel.clearRefreshToken(decoded.id)

        await logAction({
            actorId: decoded.id,
            action: AUDIT_ACTIONS.TOKEN_REUSE_DETECTED,
            entityType: 'users',
            entityId: decoded.id,
            metadata: {},
        })

        throw new AppError('Refresh token reused or invalid', 401, ERROR_CODES.TOKEN_EXPIRED)
    }

    const user = result.rows[0]

    // 🔥 generate new tokens
    const newAccessToken = generateAccessToken({ id: user.id })
    const newRefreshToken = generateRefreshToken({ id: user.id })

    // 🔥 hash NEW refresh token before saving
    const hashedNewToken = hashToken(newRefreshToken)

    await UserModel.saveRefreshToken(
        user.id,
        hashedNewToken
    )

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    }
}

export const logoutService = async (userId) => {
    await UserModel.clearRefreshToken(userId)
}