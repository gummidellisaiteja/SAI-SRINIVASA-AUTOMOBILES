const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function initDB() {
    const serverName = process.env.DB_SERVER || 'SAITEJA';
    const dbName = process.env.DB_NAME || 'sai_automobiles_db';

    // 1. Connect to master database first to ensure database exists
    const masterConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=master;Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
    
    console.log('Connecting to SQL Server master database...');
    try {
        const masterPool = await new sql.ConnectionPool({
            connectionString: masterConnStr,
            pool: { max: 5, min: 0, idleTimeoutMillis: 10000 }
        }).connect();

        console.log('Connected to master. Checking if database ' + dbName + ' exists...');
        await masterPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
            BEGIN
                CREATE DATABASE [${dbName}];
            END
        `);
        console.log(`Database '${dbName}' verified/created.`);
        await masterPool.close();
    } catch (err) {
        console.error('Error creating database in master:', err.message);
        process.exit(1);
    }

    // 2. Connect to target database sai_automobiles_db
    const targetConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
    try {
        const dbPool = await new sql.ConnectionPool({
            connectionString: targetConnStr,
            pool: { max: 5, min: 0, idleTimeoutMillis: 10000 }
        }).connect();

        console.log(`Connected to database '${dbName}'. Initializing users table...`);

        // Drop legacy tables if present
        await dbPool.request().query(`
            IF OBJECT_ID('dbo.spare_parts', 'U') IS NOT NULL DROP TABLE dbo.spare_parts;
            IF OBJECT_ID('dbo.customer_requests', 'U') IS NOT NULL DROP TABLE dbo.customer_requests;
            IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
            IF OBJECT_ID('dbo.transactions', 'U') IS NOT NULL DROP TABLE dbo.transactions;
            IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
            IF OBJECT_ID('dbo.inventory', 'U') IS NOT NULL DROP TABLE dbo.inventory;
            IF OBJECT_ID('dbo.services', 'U') IS NOT NULL DROP TABLE dbo.services;
            IF OBJECT_ID('dbo.dashboard_stats', 'U') IS NOT NULL DROP TABLE dbo.dashboard_stats;
        `);

        // Create users table
        await dbPool.request().query(`
            IF OBJECT_ID('dbo.users', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(100) NOT NULL,
                    username NVARCHAR(100) NOT NULL,
                    email NVARCHAR(255) NULL,
                    password_hash NVARCHAR(255) NOT NULL,
                    role NVARCHAR(20) NOT NULL DEFAULT 'owner',
                    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                    CONSTRAINT UQ_users_username UNIQUE (username),
                    CONSTRAINT CK_users_role CHECK (role = 'owner')
                );
            END
        `);

        // Empty table check
        const countRes = await dbPool.request().query(`SELECT COUNT(*) AS total FROM users`);
        console.log(`'users' table successfully ready! Total records: ${countRes.recordset[0].total}`);

        await dbPool.close();
        console.log('Database initialization complete!');
    } catch (err) {
        console.error('Error initializing users table:', err.message);
        process.exit(1);
    }
}

initDB();
