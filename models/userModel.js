import pool from '../db/index.js'

/**
 * GET ALL USERS (with pagination)
 */
export const findAllUsers = async (limit = 10, offset = 0) => {
    const safeLimit = Math.min(Number(limit) || 10, 100)
    const safeOffset = Math.max(Number(offset) || 0, 0)

    const query = `
        SELECT id, name, email
        FROM users
        WHERE is_deleted = FALSE
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
    `

    return await pool.query(query, [safeLimit, safeOffset])
}


/**
 * GET USER BY ID
 */
export const findUserById = async (id) => {
    const query = `
        SELECT id, name, email
        FROM users
        WHERE id = $1 AND is_deleted = FALSE
        LIMIT 1
    `

    return await pool.query(query, [id])
}


/**
 * CREATE USER
 */
export const createUser = async (name, email) => {
    const normalizedEmail = email.toLowerCase()

    const query = `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        RETURNING name, email
    `

    return await pool.query(query, [name, normalizedEmail])
}


/**
 * UPDATE USER (PUT & PATCH)
 */
export const updateUser = async (id, data) => {
    const allowedFields = ['name', 'email']

    const fields = []
    const values = []
    let index = 1

    for (const key in data) {
        if (!allowedFields.includes(key)) {
            const error = new Error(`Invalid field: ${key}`)
            error.status = 400
            throw error
        }

        let value = data[key]

        // Normalize email
        if (key === 'email') {
            value = value.toLowerCase()
        }

        fields.push(`${key} = $${index}`)
        values.push(value)
        index++
    }

    if (fields.length === 0) {
        const error = new Error('No valid fields to update')
        error.status = 400
        throw error
    }

    values.push(id)

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${index} AND is_deleted = FALSE
        RETURNING name, email
    `

    return await pool.query(query, values)
}


/**
 * DELETE USER (SOFT DELETE)
 */
export const deleteUser = async (id) => {
    const query = `
        UPDATE users
        SET is_deleted = TRUE
        WHERE id = $1 AND is_deleted = FALSE
        RETURNING  name, email
    `

    return await pool.query(query, [id])
}


/**
 * COUNT USERS (excluding deleted)
 */
export const countUsers = async () => {
    const result = await pool.query(`
        SELECT COUNT(*) FROM users
        WHERE is_deleted = FALSE
    `)

    return Number(result.rows[0].count)
}