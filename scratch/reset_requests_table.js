const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function resetRequestsTable() {
    const serverName = process.env.DB_SERVER || 'SAITEJA';
    const dbName = process.env.DB_NAME || 'sai_automobiles_db';

    const pool = await new sql.ConnectionPool({
        connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
    }).connect();

    await pool.request().query(`TRUNCATE TABLE dbo.spare_part_requests;`);
    const countRes = await pool.request().query(`SELECT COUNT(*) AS total FROM dbo.spare_part_requests;`);
    console.log(`Table 'spare_part_requests' reset! Total records: ${countRes.recordset[0].total}`);
    await pool.close();
}

resetRequestsTable();
