import { z } from 'zod'

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
    }),
})

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
})

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
    }),
})


export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
})

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string(),
        newPassword: z.string().min(6),
    }),
})

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string(),
    }),
})