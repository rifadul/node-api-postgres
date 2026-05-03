import * as UserModel from '../models/userModel.js'
import asyncHandler from '../middleware/asyncHandler.js'

// GET /users
export const getUsers = asyncHandler(async (req, res) => {
    const { query } = req.validated

    let { page = 1, limit = 10 } = query

    page = Number(page)
    limit = Number(limit)

    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const offset = (page - 1) * limit

    const [usersResult, countResult] = await Promise.all([
        UserModel.findAllUsers(limit, offset),
        UserModel.countUsers(),
    ])

    const total = Number(countResult.rows[0].count)

    res.status(200).json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: usersResult.rows,
    })
})


// GET /users/:id
export const getUserById = asyncHandler(async (req, res) => {
    const { params } = req.validated
    const id = Number(params.id)
    console.log('-------------jjjj', { params });


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
    const { body } = req.validated
    const { name, email } = body

    const result = await UserModel.createUser(name, email)

    res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0],
    })
})


// PUT /users/:id
export const updateUser = asyncHandler(async (req, res) => {
    const { params, body } = req.validated
    const id = Number(params.id)

    const result = await UserModel.updateUser(id, body)

    if (result.rowCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    res.status(200).json({
        message: 'User fully updated',
        user: result.rows[0],
    })
})


// PATCH /users/:id
export const patchUser = asyncHandler(async (req, res) => {
    const { params, body } = req.validated
    const id = Number(params.id)

    const result = await UserModel.updateUser(id, body)

    if (result.rowCount === 0) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    res.status(200).json({
        message: 'User partially updated',
        user: result.rows[0],
    })
})


// DELETE /users/:id
export const deleteUser = asyncHandler(async (req, res) => {
    const { params } = req.validated
    const id = Number(params.id)

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