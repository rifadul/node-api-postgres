import asyncHandler from '../middleware/asyncHandler.js'
import * as UserService from '../services/userService.js'

// GET /users
export const getUsers = asyncHandler(async (req, res) => {
    const { query } = req.validated

    let { page = 1, limit = 10 } = query

    page = Number(page)
    limit = Number(limit)

    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const { data, total } = await UserService.getUsersService(page, limit)

    res.status(200).json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data,
    })
})

// GET /users/:id
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.validated.params

    const user = await UserService.getUserByIdService(Number(id))

    res.status(200).json({
        success: true,
        data: user,
    })
})

// POST /users
export const createUser = asyncHandler(async (req, res) => {
    const { name, email } = req.validated.body

    const user = await UserService.createUserService(name, email)

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
    })
})

// PUT
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params
    const body = req.validated.body

    const user = await UserService.updateUserService(Number(id), body)

    res.status(200).json({
        success: true,
        message: 'User fully updated',
        data: user,
    })
})

// PATCH
export const patchUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params
    const body = req.validated.body

    const user = await UserService.patchUserService(Number(id), body)

    res.status(200).json({
        success: true,
        message: 'User partially updated',
        data: user,
    })
})

// DELETE
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params

    const user = await UserService.deleteUserService(Number(id))

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: user,
    })
})