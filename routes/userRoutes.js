import express from 'express'
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js'

import validate from '../middleware/validate.js'
import {
    createUserSchema,
    patchUserSchema,
    updateUserSchema,
} from '../validators/userValidator.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', validate(createUserSchema), createUser)
router.put('/:id', validate(updateUserSchema), updateUser)
router.patch('/:id', validate(patchUserSchema), updateUser)

router.delete('/:id', deleteUser)

export default router