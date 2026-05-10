import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
})

export default pool