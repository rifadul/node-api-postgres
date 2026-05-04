import * as UserModel from '../models/userModel.js'
import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

// GET USERS
export const getUsersService = async (page, limit) => {
    const offset = (page - 1) * limit

    const [usersResult, countResult] = await Promise.all([
        UserModel.findAllUsers(limit, offset),
        UserModel.countUsers(),
    ])

    const total = countResult

    return {
        data: usersResult.rows,
        total,
    }
}

// GET USER
export const getUserByIdService = async (id) => {
    const result = await UserModel.findUserById(id)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}

// CREATE
export const createUserService = async (name, email) => {
    const normalizedEmail = email.toLowerCase()

    const result = await UserModel.createUser(name, normalizedEmail)
    return result.rows[0]
}

// PUT
export const updateUserService = async (id, data) => {
    const updatedData = {
        ...data,
        ...(data.email && { email: data.email.toLowerCase() }),
    }

    const result = await UserModel.updateUser(id, updatedData)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}

// PATCH
export const patchUserService = async (id, data) => {
    if (!data || Object.keys(data).length === 0) {
        throw new AppError(
            'No data provided for update',
            400,
            ERROR_CODES.VALIDATION_ERROR
        )
    }

    const updatedData = {
        ...data,
        ...(data.email && { email: data.email.toLowerCase() }),
    }

    const result = await UserModel.updateUser(id, updatedData)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}

// DELETE
export const deleteUserService = async (id) => {
    const result = await UserModel.deleteUser(id)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}