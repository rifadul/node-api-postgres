import pool from '../db/index.js'

export const findAllUsers = async () => {
    return await pool.query('SELECT * FROM users ORDER BY id ASC')
}

export const findUserById = async (id) => {
    return await pool.query('SELECT * FROM users WHERE id = $1', [id])
}

export const createUser = async (name, email) => {
    return await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    )
}

// export const updateUser = async (id, name, email) => {
//     return await pool.query(
//         'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
//         [name, email, id]
//     )
// }

export const updateUser = async (id, data) => {
    const allowedFields = ['name', 'email']

    const fields = []
    const values = []
    let index = 1

    for (const key in data) {
        if (!allowedFields.includes(key)) continue

        fields.push(`${key} = $${index}`)
        values.push(data[key])
        index++
    }

    if (fields.length === 0) {
        throw new Error('No valid fields to update')
    }

    values.push(id)

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `

    return await pool.query(query, values)
}

export const deleteUser = async (id) => {
    return await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
    )
}