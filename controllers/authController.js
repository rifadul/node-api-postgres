import asyncHandler from '../middleware/asyncHandler.js'
import * as AuthService from '../services/auth/authService.js'
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

    const { user, accessToken, refreshToken } = await AuthService.loginService(email, password)

    return successResponse(res, {
        message: 'Login successful',
        data: { user, accessToken, refreshToken },
    })
})

export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.params.id
    console.log({ userId });

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
    const { refreshToken } = req.validated.body

    const data = await AuthService.refreshTokenService(
        refreshToken
    )

    return successResponse(res, {
        message: 'Token refreshed',
        data,
    })
})

export const logout = asyncHandler(async (req, res) => {
    await AuthService.logoutService(req.user.id)

    return successResponse(res, {
        message: 'Logged out successfully',
    })
})