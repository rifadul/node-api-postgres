import pool from '../db/index.js'

// GET USERS
export const findAllUsers = async (limit, offset) => {
    const query = `
        SELECT id, name, email
        FROM users
        WHERE is_deleted = FALSE
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
    `
    return pool.query(query, [limit, offset])
}

// GET USER
export const findUserById = async (id) => {
    return pool.query(
        `SELECT id, name, email FROM users WHERE id = $1 AND is_deleted = FALSE LIMIT 1`,
        [id]
    )
}

// CREATE
export const createUser = async (name, email) => {
    return pool.query(
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email`,
        [name, email]
    )
}

// UPDATE
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

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${i} AND is_deleted = FALSE
        RETURNING id, name, email
    `

    return pool.query(query, values)
}

// DELETE (soft)
export const deleteUser = async (id) => {
    return pool.query(
        `UPDATE users SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id, name, email`,
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