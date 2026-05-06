import { ERROR_CODES } from '../constants/errorCodes.js'
import asyncHandler from '../middleware/asyncHandler.js'
import * as AuthService from '../services/auth/authService.js'
import { accessCookieOptions, refreshCookieOptions } from '../utils/cookies.js'
import { successResponse } from '../utils/response.js'

// REGISTER
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.validated.body

    const { user } = await AuthService.registerService(
        name,
        email,
        password
    )

    return successResponse(res, {
        status: 201,
        message: 'User registered',
        data: { user },
    })
})

// LOGIN
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body

    const { user, accessToken, refreshToken } =
        await AuthService.loginService(email, password)

    // 🔒 set cookies
    res.cookie('accessToken', accessToken, accessCookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    return successResponse(res, {
        message: 'Login successful',
        data: { user },
    })
})

export const changePassword = asyncHandler(async (req, res) => {

    if (!req.user || !req.user.id) {
        throw new AppError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED)
    }
    const userId = req.user.id

    const { currentPassword, newPassword } = req.validated.body

    await AuthService.changePasswordService(
        userId,
        currentPassword,
        newPassword
    )

    return successResponse(res, {
        message: 'Password changed successfully',
    })
})


export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.validated.body

    await AuthService.forgotPasswordService(email)

    return successResponse(res, {
        message: 'If email exists, reset link sent',
    })
})

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.validated.body

    await AuthService.resetPasswordService(token, newPassword)

    return successResponse(res, {
        message: 'Password reset successful',
    })
})

export const refreshToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken

    const { accessToken, refreshToken } =
        await AuthService.refreshTokenService(oldRefreshToken)

    // 🔁 rotate cookies
    res.cookie('accessToken', accessToken, accessCookieOptions)
    res.cookie('refreshToken', refreshToken, refreshCookieOptions)

    return successResponse(res, {
        message: 'Token refreshed',
    })
})

export const logout = asyncHandler(async (req, res) => {
    await AuthService.logoutService(req.user.id)

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    return successResponse(res, {
        message: 'Logged out successfully',
    })
})