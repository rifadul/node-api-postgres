import asyncHandler from '../middleware/asyncHandler.js'
import * as AuthService from '../services/auth/authService.js'
import { successResponse } from '../utils/response.js'

// REGISTER
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.validated.body

    const { user, token } = await AuthService.registerService(
        name,
        email,
        password
    )

    return successResponse(res, {
        status: 201,
        message: 'User registered',
        data: { user, token },
    })
})

// LOGIN
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.validated.body

    const { user, token } = await AuthService.loginService(email, password)

    return successResponse(res, {
        message: 'Login successful',
        data: { user, token },
    })
})

export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id
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