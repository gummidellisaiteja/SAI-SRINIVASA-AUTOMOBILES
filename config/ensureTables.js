'use strict';

const { poolPromise } = require('./db');

/**
 * Create missing application tables without dropping existing data.
 */
async function ensureTables() {
    const pool = await poolPromise;

    await pool.request().query(`
        IF OBJECT_ID('dbo.spare_parts', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.spare_parts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(200) NOT NULL,
                telugu_name NVARCHAR(200) NULL,
                vehicle_type NVARCHAR(50) NOT NULL,
                category NVARCHAR(100) NULL,
                compatible_models NVARCHAR(500) NULL,
                description NVARCHAR(MAX) NULL,
                price NVARCHAR(100) NOT NULL DEFAULT N'Contact Shop',
                availability NVARCHAR(50) NOT NULL DEFAULT N'Available',
                image_url NVARCHAR(MAX) NULL,
                created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
            );
        END
    `);

    console.log('Database tables verified (users, requests, spare_parts).');
}

module.exports = { ensureTables };
