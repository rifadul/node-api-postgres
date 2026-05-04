import asyncHandler from '../middleware/asyncHandler.js'
import * as UserService from '../services/userService.js'

export const getUsers = asyncHandler(async (req, res) => {
    const { query } = req.validated

    let { page = 1, limit = 10 } = query

    page = Number(page)
    limit = Number(limit)

    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const { data, total } = await UserService.getUsersService(page, limit)

    res.status(200).json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data,
    })
})

export const getUserById = asyncHandler(async (req, res) => {
    const { params } = req.validated
    const id = Number(params.id)

    const user = await UserService.getUserByIdService(id)

    res.status(200).json(user)
})

export const createUser = asyncHandler(async (req, res) => {
    const { body } = req.validated
    const { name, email } = body

    const user = await UserService.createUserService(name, email)

    res.status(201).json({
        message: 'User created successfully',
        user,
    })
})

export const updateUser = asyncHandler(async (req, res) => {
    const { params, body } = req.validated
    const id = Number(params.id)

    const user = await UserService.updateUserService(id, body)

    res.status(200).json({
        message: 'User fully updated',
        user,
    })
})

export const patchUser = asyncHandler(async (req, res) => {
    const { params, body } = req.validated
    const id = Number(params.id)

    const user = await UserService.patchUserService(id, body) // 🔥 CHANGED

    res.status(200).json({
        message: 'User partially updated',
        user,
    })
})

export const deleteUser = asyncHandler(async (req, res) => {
    const { params } = req.validated
    const id = Number(params.id)

    const user = await UserService.deleteUserService(id)

    res.status(200).json({
        message: 'User deleted successfully',
        user,
    })
})