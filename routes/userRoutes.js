import express from 'express'

const router = express.Router() // ✅ THIS LINE IS MISSING

import {
    getUsers,
    getUserById, updateUser,
    patchUser,
    deleteUser,
    restoreUser
} from '../controllers/userController.js'

import validate from '../middleware/validate.js'

import {
    updateUserSchema,
    patchUserSchema,
    userIdSchema,
    paginationSchema
} from '../validators/user.validator.js'
import authMiddleware from '../middleware/authMiddleware.js'

// routes
router.get('/', authMiddleware, validate(paginationSchema), getUsers)

router.get('/:id', authMiddleware, validate(userIdSchema), getUserById)

router.put('/:id',
    authMiddleware,
    validate(userIdSchema),
    validate(updateUserSchema),
    updateUser
)

router.patch('/:id',
    authMiddleware,
    validate(userIdSchema),
    validate(patchUserSchema),
    patchUser
)

router.delete('/:id', authMiddleware, validate(userIdSchema), deleteUser)

router.patch('/:id/restore', authMiddleware, validate(userIdSchema), restoreUser)


export default router