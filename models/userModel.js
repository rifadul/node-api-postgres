import pool from '../db/index.js'

// GET ALL USERS (with pagination support)
export const findAllUsers = async (limit = 10, offset = 0) => {
    const query = `
        SELECT * FROM users
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
    `
    return await pool.query(query, [limit, offset])
}

// GET USER BY ID
export const findUserById = async (id) => {
    const query = `
        SELECT * FROM users
        WHERE id = $1
        LIMIT 1
    `
    return await pool.query(query, [id])
}

// CREATE USER
export const createUser = async (name, email) => {
    const query = `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        RETURNING *
    `
    return await pool.query(query, [name, email])
}

// UPDATE USER (supports both PUT & PATCH)
export const updateUser = async (id, data) => {
    const allowedFields = ['name', 'email']

    const fields = []
    const values = []
    let index = 1

    for (const key in data) {
        // Reject invalid fields explicitly
        if (!allowedFields.includes(key)) {
            const error = new Error(`Invalid field: ${key}`)
            error.status = 400
            throw error
        }

        fields.push(`${key} = $${index}`)
        values.push(data[key])
        index++
    }

    // Prevent empty updates
    if (fields.length === 0) {
        const error = new Error('No valid fields to update')
        error.status = 400
        throw error
    }

    // Add ID for WHERE clause
    values.push(id)

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `

    return await pool.query(query, values)
}

// DELETE USER (hard delete for now)
export const deleteUser = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING *
    `
    return await pool.query(query, [id])
}


// GET /users/count
export const countUsers = async () => {
    return await pool.query(
        'SELECT COUNT(*) FROM users'
        // 'SELECT COUNT(*) FROM users WHERE is_deleted = FALSE'
    )
}