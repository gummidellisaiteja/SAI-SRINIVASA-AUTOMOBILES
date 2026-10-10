-- ============================================================================
-- SAI SRINIVASA AUTOMOBILES - SQL SERVER OWNER AUTHENTICATION DATABASE SCHEMA
-- ============================================================================
-- Database: sai_automobiles_db
-- Table   : users ONLY (Starting database from ZERO for Owner Authentication)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'sai_automobiles_db')
BEGIN
    CREATE DATABASE sai_automobiles_db;
END
GO

USE sai_automobiles_db;
GO

-- Cleanup legacy tables if present from old database builds
IF OBJECT_ID('dbo.spare_parts', 'U') IS NOT NULL DROP TABLE dbo.spare_parts;
IF OBJECT_ID('dbo.customer_requests', 'U') IS NOT NULL DROP TABLE dbo.customer_requests;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.transactions', 'U') IS NOT NULL DROP TABLE dbo.transactions;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.inventory', 'U') IS NOT NULL DROP TABLE dbo.inventory;
IF OBJECT_ID('dbo.services', 'U') IS NOT NULL DROP TABLE dbo.services;
IF OBJECT_ID('dbo.dashboard_stats', 'U') IS NOT NULL DROP TABLE dbo.dashboard_stats;
GO

-- Create users table for Owner Account Authentication
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
GO
