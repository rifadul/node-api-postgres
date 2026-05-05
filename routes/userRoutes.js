import express from 'express'

const router = express.Router() // ✅ THIS LINE IS MISSING

import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    patchUser,
    deleteUser,
    restoreUser
} from '../controllers/userController.js'

import validate from '../middleware/validate.js'

import {
    createUserSchema,
    updateUserSchema,
    patchUserSchema,
    userIdSchema,
    paginationSchema,
} from '../validators/user.validator.js'

// routes
router.get('/', validate(paginationSchema), getUsers)

router.get('/:id', validate(userIdSchema), getUserById)

router.post('/', validate(createUserSchema), createUser)

router.put('/:id',
    validate(userIdSchema),
    validate(updateUserSchema),
    updateUser
)

router.patch('/:id',
    validate(userIdSchema),
    validate(patchUserSchema),
    patchUser
)

router.delete('/:id', validate(userIdSchema), deleteUser)

router.patch('/:id/restore', validate(userIdSchema), restoreUser)


export default router