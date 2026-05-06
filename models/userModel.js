import pool from '../db/index.js'

// GET USERS
export const findAllUsers = async (limit, offset) => {
    return pool.query(
        `SELECT id, name, email
         FROM users
         WHERE is_deleted = FALSE
         ORDER BY id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    )
}

// GET USER
export const findUserById = async (id) => {
    return pool.query(
        `SELECT id, name, email
         FROM users
         WHERE id = $1 AND is_deleted = FALSE
         LIMIT 1`,
        [id]
    )
}

// CREATE USER
export const createUser = async (name, email, password) => {
    return pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, password]
    )
}

// UPDATE USER
export const updateUser = async (id, data) => {
    const fields = []
    const values = []
    let i = 1

    for (const key in data) {
        fields.push(`${key} = $${i}`)
        values.push(data[key])
        i++
    }

    values.push(id)

    return pool.query(
        `UPDATE users
         SET ${fields.join(', ')}
         WHERE id = $${i} AND is_deleted = FALSE
         RETURNING id, name, email`,
        values
    )
}

// SOFT DELETE
export const deleteUser = async (id) => {
    return pool.query(
        `UPDATE users
         SET is_deleted = TRUE
         WHERE id = $1 AND is_deleted = FALSE
         RETURNING id, name, email`,
        [id]
    )
}

// COUNT
export const countUsers = async () => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM users WHERE is_deleted = FALSE`
    )
    return Number(result.rows[0].count)
}


export const restoreUser = async (id) => {
    return pool.query(
        `UPDATE users
         SET is_deleted = FALSE
         WHERE id = $1 AND is_deleted = TRUE
         RETURNING id, name, email`,
        [id]
    )
}


export const findUserByEmail = async (email) => {
    return pool.query(
        `SELECT id, name, email, password
         FROM users
         WHERE email = $1 AND is_deleted = FALSE
         LIMIT 1`,
        [email]
    )
}

export const findUserByIdWithPassword = async (id) => {
    return pool.query(
        `SELECT id, password FROM users WHERE id = $1`,
        [id]
    )
}

export const updatePassword = async (id, password) => {
    return pool.query(
        `UPDATE users SET password = $1 WHERE id = $2`,
        [password, id]
    )
}

// find by email (already exists)

// save reset token
export const saveResetToken = async (email, token, expires) => {
    return pool.query(
        `UPDATE users
         SET reset_token = $1,
             reset_token_expires = $2
         WHERE email = $3 AND is_deleted = FALSE`,
        [token, expires, email]
    )
}

// find user by reset token
export const findByResetToken = async (hashedToken) => {
    return pool.query(
        `SELECT id, reset_token_expires
         FROM users
         WHERE reset_token = $1
           AND is_deleted = FALSE`,
        [hashedToken]
    )
}

// update password + clear token
export const updatePasswordAndClearToken = async (id, password) => {
    return pool.query(
        `UPDATE users
         SET password = $1,
             reset_token = NULL,
             reset_token_expires = NULL
         WHERE id = $2`,
        [password, id]
    )
}

export const saveRefreshToken = async (userId, hashedToken) => {
    return pool.query(
        `UPDATE users
         SET refresh_token = $1
         WHERE id = $2`,
        [hashedToken, userId]
    )
}

export const findUserByRefreshToken = async (hashedToken) => {
    return pool.query(
        `SELECT id, refresh_token
         FROM users
         WHERE refresh_token = $1
           AND is_deleted = FALSE
         LIMIT 1`,
        [hashedToken]
    )
}

export const clearRefreshToken = async (userId) => {
    return pool.query(
        `UPDATE users
         SET refresh_token = NULL
         WHERE id = $1`,
        [userId]
    )
}