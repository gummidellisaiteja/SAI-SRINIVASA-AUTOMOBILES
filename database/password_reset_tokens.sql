-- ============================================================================
-- SAI SRINIVASA AUTOMOBILES - PASSWORD RESET TOKENS TABLE
-- ============================================================================
-- Database: sai_automobiles_db
-- Run this script in SSMS to add password reset support.
-- ============================================================================

USE sai_automobiles_db;
GO

-- Create password_reset_tokens table if it does not already exist
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

    -- Index for fast lookup by user_id
    CREATE INDEX IX_password_reset_tokens_user_id
        ON dbo.password_reset_tokens (user_id);
END
GO

PRINT 'password_reset_tokens table ready.';
GO
