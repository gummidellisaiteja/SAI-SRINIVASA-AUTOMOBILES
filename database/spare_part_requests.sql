-- ============================================================================
-- SAI SRINIVASA AUTOMOBILES - SPARE PART REQUESTS DATABASE SCHEMA
-- ============================================================================
-- Database: sai_automobiles_db
-- Table   : spare_part_requests
-- ============================================================================

USE sai_automobiles_db;
GO

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
GO
