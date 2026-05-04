import * as UserModel from '../models/userModel.js'
import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'

/**
 * GET USERS WITH PAGINATION
 */
export const getUsersService = async (page, limit) => {
    const offset = (page - 1) * limit

    const [usersResult, total] = await Promise.all([
        UserModel.findAllUsers(limit, offset),
        UserModel.countUsers(),
    ])

    return {
        data: usersResult.rows,
        total,
    }
}


/**
 * GET USER BY ID
 */
export const getUserByIdService = async (id) => {
    const result = await UserModel.findUserById(id)
    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}


/**
 * CREATE USER
 */
export const createUserService = async (name, email) => {
    const normalizedEmail = email.toLowerCase() // 🔥 FIX
    const result = await UserModel.createUser(name, normalizedEmail)
    return result.rows[0]
}


/**
 * UPDATE USER (PUT)
 */
export const updateUserService = async (id, data) => {
    const { name, email } = data
    const normalizedEmail = email.toLowerCase()
    const result = await UserModel.updateUser(id, {
        name,
        email: normalizedEmail,
    })

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0];
}


/**
 * PATCH USER
 */
export const patchUserService = async (id, data) => {
    const updatedData = {
        ...data,
        ...(data.email && { email: data.email.toLowerCase() }),
    }

    const result = await UserModel.updateUser(id, updatedData)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0];
}


/**
 * DELETE USER
 */
export const deleteUserService = async (id) => {
    const result = await UserModel.deleteUser(id)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    return result.rows[0]
}