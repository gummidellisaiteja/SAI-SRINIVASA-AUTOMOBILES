const { poolPromise } = require('../config/db');

async function main() {
    try {
        const pool = await poolPromise;
        const cols = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLLATION_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users'
        `);
        console.log('Users table columns:', cols.recordset);
        
        const users = await pool.request().query('SELECT id, name, username, email, password_hash, role FROM users');
        console.log('Users in DB:', users.recordset);
    } catch(err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

main();
