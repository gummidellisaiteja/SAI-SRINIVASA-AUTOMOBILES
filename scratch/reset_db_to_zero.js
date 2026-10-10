const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function resetDBToZero() {
    const serverName = process.env.DB_SERVER || 'SAITEJA';
    const dbName = process.env.DB_NAME || 'sai_automobiles_db';

    const pool = await new sql.ConnectionPool({
        connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
    }).connect();

    await pool.request().query(`TRUNCATE TABLE users;`);
    const countRes = await pool.request().query(`SELECT COUNT(*) AS total FROM users;`);
    console.log(`Database reset! Total records in 'users': ${countRes.recordset[0].total}`);
    await pool.close();
}

resetDBToZero();
