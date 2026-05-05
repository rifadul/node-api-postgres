import asyncHandler from '../middleware/asyncHandler.js'
import * as UserService from '../services/userService.js'
import { successResponse } from '../utils/response.js'

// GET USERS
export const getUsers = asyncHandler(async (req, res) => {
    const { query } = req.validated

    let { page = 1, limit = 10 } = query

    page = Number(page)
    limit = Number(limit)

    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 10

    const { data, total } = await UserService.getUsersService(page, limit)

    return successResponse(res, {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
})


// GET USER BY ID
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.validated.params

    const user = await UserService.getUserByIdService(Number(id))

    return successResponse(res, {
        data: user,
    })
})



// UPDATE
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params
    const body = req.validated.body

    const user = await UserService.updateUserService(Number(id), body)

    return successResponse(res, {
        message: 'User fully updated',
        data: user,
    })
})


// PATCH
export const patchUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params
    const body = req.validated.body

    const user = await UserService.patchUserService(Number(id), body)

    return successResponse(res, {
        message: 'User partially updated',
        data: user,
    })
})


// DELETE
export const deleteUser = asyncHandler(async (req, res) => {
    console.log('-----------req.validated', req);

    const { id } = req.validated.params

    const user = await UserService.deleteUserService(Number(id))

    return successResponse(res, {
        message: 'User deleted successfully',
        data: user,
    })
})

export const restoreUser = asyncHandler(async (req, res) => {
    const { id } = req.validated.params

    const user = await UserService.restoreUserService(Number(id))

    return successResponse(res, {
        message: 'User restored successfully',
        data: user,
    })
})