/**
 * init_password_reset_table.js
 * Creates the password_reset_tokens table in SQL Server if it doesn't exist.
 * Run: node scratch/init_password_reset_table.js
 */
const { poolPromise, sql } = require('../config/db');

async function main() {
    try {
        const pool = await poolPromise;

        await pool.request().query(`
            IF OBJECT_ID('dbo.password_reset_tokens', 'U') IS NULL
            BEGIN
                CREATE TABLE dbo.password_reset_tokens (
                    id            INT IDENTITY(1,1) PRIMARY KEY,
                    user_id       INT NOT NULL,
                    token_hash    NVARCHAR(255) NOT NULL,
                    expires_at    DATETIME2 NOT NULL,
                    attempts      INT NOT NULL DEFAULT 0,
                    used_at       DATETIME2 NULL,
                    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

                    CONSTRAINT FK_password_reset_tokens_user
                        FOREIGN KEY (user_id)
                        REFERENCES users(id)
                );
                CREATE INDEX IX_password_reset_tokens_user_id
                    ON dbo.password_reset_tokens (user_id);
                PRINT 'password_reset_tokens table created.';
            END
            ELSE
            BEGIN
                PRINT 'password_reset_tokens table already exists.';
            END
        `);

        console.log('✅ password_reset_tokens table is ready in SQL Server.');
    } catch (err) {
        console.error('❌ Failed to create password_reset_tokens table:', err.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
