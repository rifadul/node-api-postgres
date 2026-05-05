import express from 'express'
import validate from '../middleware/validate.js'
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js'
import { register, login, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post(
    '/change-password',
    authMiddleware,
    validate(changePasswordSchema),
    changePassword
)

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)

router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

export default router