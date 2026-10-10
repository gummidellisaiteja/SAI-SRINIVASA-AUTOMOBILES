const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function initRequestsTable() {
    const serverName = process.env.DB_SERVER || 'SAITEJA';
    const dbName = process.env.DB_NAME || 'sai_automobiles_db';

    const connStr = `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
    
    console.log('Connecting to SQL Server database ' + dbName + '...');
    try {
        const dbPool = await new sql.ConnectionPool({
            connectionString: connStr,
            pool: { max: 5, min: 0, idleTimeoutMillis: 10000 }
        }).connect();

        console.log('Creating spare_part_requests table if not exists...');
        await dbPool.request().query(`
            IF OBJECT_ID('dbo.spare_part_requests', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.spare_part_requests (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    customer_name NVARCHAR(100) NOT NULL,
                    mobile_number NVARCHAR(20) NOT NULL,
                    part_name NVARCHAR(200) NOT NULL,
                    vehicle_type NVARCHAR(50) NOT NULL,
                    vehicle_model NVARCHAR(150) NULL,
                    quantity INT NULL DEFAULT 1,
                    description NVARCHAR(MAX) NULL,
                    image_url NVARCHAR(500) NULL,
                    status NVARCHAR(30) NOT NULL DEFAULT 'Pending',
                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                    CONSTRAINT CK_spare_part_requests_status
                    CHECK (status IN ('Pending', 'Contacted', 'Available', 'Not Available', 'Completed', 'Cancelled'))
                );
            END
        `);

        const countRes = await dbPool.request().query(`SELECT COUNT(*) AS total FROM spare_part_requests`);
        console.log(`'spare_part_requests' table ready! Total records: ${countRes.recordset[0].total}`);

        await dbPool.close();
        console.log('Requests table initialization complete!');
    } catch (err) {
        console.error('Error creating spare_part_requests table:', err.message);
        process.exit(1);
    }
}

initRequestsTable();
