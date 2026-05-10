import csrf from 'csurf'
import express from 'express'
import validate from '../middleware/validate.js'
import { registerSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from '../validators/auth.validator.js'
import { register, login, changePassword, forgotPassword, resetPassword, logout, refreshToken } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()
const csrfProtection = csrf({ cookie: true })


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
router.post('/refresh-token', refreshToken)
router.post(
    '/logout',
    authMiddleware,
    logout
)

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({
        csrfToken: req.csrfToken(),
    })
})

export default router