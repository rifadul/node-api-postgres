import 'dotenv/config';
import pg from 'pg';

// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// export const query = (text, params) => pool.query(text, params);

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
})


const getUsers = async (request, response) => {
    try {
        const results = await pool.query('SELECT * FROM users ORDER BY id ASC')
        response.status(200).json(results.rows)
    } catch (error) {
        throw error
    }
}


const getUserById = async (request, response) => {
    const id = parseInt(request.params.id, 10)

    try {
        const results = await pool.query('SELECT * FROM users WHERE id = $1', [id])
        response.status(200).json(results.rows)
    } catch (error) {
        throw error
    }
}


const createUser = async (request, response) => {
    const { name, email } = request.body

    try {
        const results = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        )
        response.status(201).json({
            message: 'User added successfully',
            user: results.rows[0],
        })
    } catch (error) {
        throw error
    }
}


const updateUser = async (request, response) => {
    const id = parseInt(request.params.id, 10)
    const { name, email } = request.body

    try {
        await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [
            name,
            email,
            id,
        ])
        response.status(200).json({
            message: `User updated successfully`,
            user: {
                id,
                name,
                email,
            },
        })
    } catch (error) {
        throw error
    }
}


const deleteUser = async (request, response) => {
    const id = parseInt(request.params.id, 10)

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        )

        if (result.rowCount === 0) {
            return response.status(404).json({ message: 'User not found' })
        }

        response.status(200).json({
            message: 'User deleted successfully',
            user: result.rows[0],
        })
    } catch (error) {
        console.error(error)
        response.status(500).json({ message: 'Internal server error' })
    }
}


export {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}