import * as UserModel from '../models/userModel.js'
import AppError from '../utils/AppError.js'
import { ERROR_CODES } from '../constants/errorCodes.js'
import { logAction } from './auditLogService.js'
import { AUDIT_ACTIONS } from '../constants/auditActions.js'

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
export const deleteUserService = async (id, actorId) => {
    const result = await UserModel.deleteUser(id)

    if (result.rowCount === 0) {
        throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND)
    }

    const user = result.rows[0]

    // ✅ audit log
    await logAction({
        actorId,
        action: AUDIT_ACTIONS.DELETE_USER,
        entityType: 'users',
        entityId: user.id,
        metadata: {
            name: user.name,
            email: user.email,
        },
    })

    return user
}

export const restoreUserService = async (id) => {
    try {
        const result = await UserModel.restoreUser(id)

        if (result.rowCount === 0) {
            throw new AppError(
                'User not found or already active',
                404
            )
        }

        return result.rows[0]
    } catch (err) {
        if (err.code === '23505') {
            throw new AppError(
                'Cannot restore user: email already in use',
                400,
                ERROR_CODES.EMAIL_ALREADY_EXISTS
            )
        }

        throw err
    }
}