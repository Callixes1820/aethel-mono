import mysql from 'mysql2/promise';

// Create a connection pool to handle multiple connections
// MySQL credentials provided by user: mysql://root:12345@localhost:3306/aethel_mono_hms
export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345', // In production, this should be in .env, but hardcoding as per user env for local refactor
    database: 'aethel_mono_hms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper to execute queries
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
    const [results] = await pool.execute(sql, params);
    return results as T;
}
