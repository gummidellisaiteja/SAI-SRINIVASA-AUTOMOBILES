-- ============================================================================
-- SAI SRINIVASA AUTOMOBILES - SQL SERVER AUTHENTICATION SEED / CLEANUP SCRIPT
-- ============================================================================

USE sai_automobiles_db;
GO

-- Clean up any non-users tables if they exist
IF OBJECT_ID('dbo.spare_parts', 'U') IS NOT NULL DROP TABLE dbo.spare_parts;
IF OBJECT_ID('dbo.customer_requests', 'U') IS NOT NULL DROP TABLE dbo.customer_requests;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
GO

-- Note: The users table can remain empty for First-Time Setup at http://localhost:5000/setup.html
-- Alternatively, if you wish to seed an initial account manually in SSMS, use a bcrypt hashed password:
--
-- INSERT INTO dbo.users (name, username, email, password_hash, role)
-- VALUES ('RamBabu', 'rambabu', 'rambabu@saisrinivasa.com', '<bcrypt_hash_here>', 'owner');
-- GO
