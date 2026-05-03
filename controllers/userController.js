import * as UserModel from '../models/userModel.js'
import asyncHandler from '../middleware/asyncHandler.js'

// GET /users
export const getUsers = asyncHandler(async (req, res) => {
    const result = await UserModel.findAllUsers()
    res.status(200).json(result.rows)
})

// GET /users/:id
export const getUserById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
        const error = new Error('Invalid user ID')
        error.status = 400
        throw error
    }

    const result = await UserModel.findUserById(id)

    if (result.rowCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    res.status(200).json(result.rows[0])
})

// POST /users
export const createUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body

    const result = await UserModel.createUser(name, email)

    res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0],
    })
})

// PUT /users/:id

export const updateUser = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
        const error = new Error('Invalid user ID')
        error.status = 400
        throw error
    }

    const data = req.body

    const result = await UserModel.updateUser(id, data)

    if (result.rowCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    res.status(200).json({
        message: 'User updated successfully',
        user: result.rows[0],
    })
})

// DELETE /users/:id
export const deleteUser = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
        const error = new Error('Invalid user ID')
        error.status = 400
        throw error
    }

    const result = await UserModel.deleteUser(id)

    if (result.rowCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    res.status(200).json({
        message: 'User deleted successfully',
        user: result.rows[0],
    })
})