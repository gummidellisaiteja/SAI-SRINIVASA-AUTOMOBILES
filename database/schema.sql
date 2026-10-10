-- ============================================================================
-- SAI SRINIVASA AUTOMOBILES - SQL SERVER DATABASE SCHEMA
-- ============================================================================

USE sai_automobiles_db;
GO

-- 1. USERS TABLE (OWNER AUTHENTICATION)
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        username NVARCHAR(100) NOT NULL UNIQUE,
        email NVARCHAR(255) NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'owner',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT CK_users_role CHECK (role = 'owner')
    );
END
GO

-- 2. SPARE PARTS INVENTORY TABLE
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
GO

-- 3. SPARE PART / SERVICE REQUESTS TABLE
IF OBJECT_ID('dbo.spare_part_requests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.spare_part_requests (
        id INT IDENTITY(1001,1) PRIMARY KEY,
        customer_name NVARCHAR(100) NOT NULL,
        mobile_number NVARCHAR(20) NOT NULL,
        part_name NVARCHAR(200) NOT NULL,
        vehicle_type NVARCHAR(50) NOT NULL DEFAULT 'Two Wheeler',
        vehicle_model NVARCHAR(150) NULL,
        quantity INT NOT NULL DEFAULT 1,
        description NVARCHAR(MAX) NULL,
        image_url NVARCHAR(500) NULL,
        status NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO
