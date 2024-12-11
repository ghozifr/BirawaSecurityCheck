import 'dotenv/config'
import { createPool } from "mysql2/promise";

// Pool for database creation
export const tempPool = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
})

export const pool = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
})

export async function testConnection () {
    try {
        const connection = await pool.getConnection()
        console.log("Connected to the database!")
        connection.release()
    } catch (err) {
        console.error("Unable to connect to the database:", err)
        throw err
    }
}