const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { requireOwnerAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['Pending', 'Contacted', 'Available', 'Not Available', 'Completed', 'Cancelled'];
const VALID_VEHICLE_TYPES = ['Two Wheeler', 'Four Wheeler', 'Tractor'];

/* =========================================================
   1. CREATE SPARE PART REQUEST (PUBLIC)
   POST /api/requests/spare-part (also handles /api/requests)
========================================================= */
async function handleCreateSparePartRequest(req, res) {
    try {
        const {
            customerName,
            customer_name,
            mobileNumber,
            mobile_number,
            partName,
            part_name,
            vehicleType,
            vehicle_type,
            vehicleModel,
            vehicle_model,
            brand,
            quantity,
            description,
            notes,
            imageUrl,
            image_url
        } = req.body;

        const name = (customerName || customer_name || '').trim();
        const mobile = (mobileNumber || mobile_number || '').trim();
        const part = (partName || part_name || '').trim();
        const vType = (vehicleType || vehicle_type || '').trim();

        let model = (vehicleModel || vehicle_model || '').trim();
        if (!model && brand && brand.trim()) {
            model = brand.trim();
        }

        const qty = parseInt(quantity, 10) || 1;
        const desc = (description || notes || '').trim();
        const img = (imageUrl || image_url || '').trim();

        // 1. Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Customer name is required.'
            });
        }

        if (!mobile) {
            return res.status(400).json({
                success: false,
                error: 'Mobile number is required.'
            });
        }

        // Clean digits only for phone validation
        const cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid 10-digit mobile number.'
            });
        }

        if (!part) {
            return res.status(400).json({
                success: false,
                error: 'Spare part name is required.'
            });
        }

        if (!vType || !VALID_VEHICLE_TYPES.includes(vType)) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle type must be Two Wheeler, Four Wheeler, or Tractor.'
            });
        }

        const pool = await poolPromise;

        // 2. Insert into SQL Server using Parameterized Query
        const result = await pool.request()
            .input('customer_name', sql.NVarChar(100), name)
            .input('mobile_number', sql.NVarChar(20), cleanMobile)
            .input('part_name', sql.NVarChar(200), part)
            .input('vehicle_type', sql.NVarChar(50), vType)
            .input('vehicle_model', sql.NVarChar(150), model || null)
            .input('quantity', sql.Int, qty)
            .input('description', sql.NVarChar(sql.MAX), desc || null)
            .input('image_url', sql.NVarChar(500), img || null)
            .query(`
                INSERT INTO dbo.spare_part_requests (
                    customer_name,
                    mobile_number,
                    part_name,
                    vehicle_type,
                    vehicle_model,
                    quantity,
                    description,
                    image_url,
                    status,
                    created_at,
                    updated_at
                )
                OUTPUT INSERTED.id
                VALUES (
                    @customer_name,
                    @mobile_number,
                    @part_name,
                    @vehicle_type,
                    @vehicle_model,
                    @quantity,
                    @description,
                    @image_url,
                    'Pending',
                    SYSUTCDATETIME(),
                    SYSUTCDATETIME()
                );
            `);

        const newId = result.recordset[0]?.id;
        const formattedId = newId ? `REQ-${newId}` : `REQ-${Date.now()}`;

        return res.status(201).json({
            success: true,
            message: 'Spare part request submitted successfully.',
            requestId: formattedId,
            numericId: newId
        });

    } catch (err) {
        console.error('Create spare part request error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Unable to submit your request right now. Please try again later.'
        });
    }
}

router.post('/spare-part', handleCreateSparePartRequest);
router.post('/', handleCreateSparePartRequest);

/* =========================================================
   2. GET PENDING & STATUS COUNT FOR BADGES / DASHBOARD
   GET /api/requests/spare-parts/count
   GET /api/requests/count
   Protected (Owner Only)
========================================================= */
async function handleGetRequestCounts(req, res) {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pendingCount,
                COUNT(CASE WHEN status = 'Contacted' THEN 1 END) AS contactedCount,
                COUNT(CASE WHEN status = 'Available' THEN 1 END) AS availableCount,
                COUNT(CASE WHEN status = 'Not Available' THEN 1 END) AS notAvailableCount,
                COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS completedCount,
                COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS cancelledCount,
                COUNT(*) AS totalCount
            FROM dbo.spare_part_requests;
        `);

        const data = result.recordset[0] || {};

        return res.json({
            success: true,
            pendingCount: Number(data.pendingCount || 0),
            counts: {
                pending: Number(data.pendingCount || 0),
                contacted: Number(data.contactedCount || 0),
                available: Number(data.availableCount || 0),
                notAvailable: Number(data.notAvailableCount || 0),
                completed: Number(data.completedCount || 0),
                cancelled: Number(data.cancelledCount || 0),
                total: Number(data.totalCount || 0)
            }
        });
    } catch (err) {
        console.error('Request counts error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve request metrics.'
        });
    }
}

router.get('/spare-parts/count', requireOwnerAuth, handleGetRequestCounts);
router.get('/count', requireOwnerAuth, handleGetRequestCounts);

/* =========================================================
   3. GET ALL SPARE PART REQUESTS (SEARCH & STATUS FILTER)
   GET /api/requests/spare-parts
   GET /api/requests
   Protected (Owner Only)
========================================================= */
async function handleGetSparePartRequests(req, res) {
    try {
        const { search, status, vehicle } = req.query;

        const pool = await poolPromise;
        let requestQuery = pool.request();

        let sqlQuery = `
            SELECT
                id,
                customer_name,
                mobile_number,
                part_name,
                vehicle_type,
                vehicle_model,
                quantity,
                description,
                image_url,
                status,
                created_at,
                updated_at
            FROM dbo.spare_part_requests
            WHERE 1=1
        `;

        if (status && status !== 'All') {
            requestQuery.input('status', sql.NVarChar(30), status);
            sqlQuery += ` AND status = @status`;
        }

        if (vehicle && vehicle !== 'All') {
            requestQuery.input('vehicle_type', sql.NVarChar(50), vehicle);
            sqlQuery += ` AND vehicle_type = @vehicle_type`;
        }

        if (search && search.trim()) {
            requestQuery.input('search', sql.NVarChar(100), `%${search.trim()}%`);
            sqlQuery += ` AND (
                customer_name LIKE @search
                OR mobile_number LIKE @search
                OR part_name LIKE @search
                OR vehicle_model LIKE @search
                OR CAST(id AS NVARCHAR(20)) LIKE @search
            )`;
        }

        sqlQuery += ` ORDER BY created_at DESC`;

        const result = await requestQuery.query(sqlQuery);

        return res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        console.error('Get spare part requests error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve spare part requests.'
        });
    }
}

router.get('/spare-parts', requireOwnerAuth, handleGetSparePartRequests);
router.get('/', requireOwnerAuth, handleGetSparePartRequests);

/* =========================================================
   4. GET SINGLE REQUEST DETAILS
   GET /api/requests/spare-parts/:id
   GET /api/requests/:id
   Protected (Owner Only)
========================================================= */
async function handleGetRequestById(req, res) {
    try {
        const rawId = req.params.id;
        const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10);
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .query(`
                SELECT TOP 1
                    id,
                    customer_name,
                    mobile_number,
                    part_name,
                    vehicle_type,
                    vehicle_model,
                    quantity,
                    description,
                    image_url,
                    status,
                    created_at,
                    updated_at
                FROM dbo.spare_part_requests
                WHERE id = @id
            `);

        const requestRecord = result.recordset[0];
        if (!requestRecord) {
            return res.status(404).json({
                success: false,
                error: 'Spare part request not found.'
            });
        }

        return res.json({
            success: true,
            data: requestRecord
        });
    } catch (err) {
        console.error('Get request details error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve request details.'
        });
    }
}

router.get('/spare-parts/:id', requireOwnerAuth, handleGetRequestById);
router.get('/:id', requireOwnerAuth, handleGetRequestById);

/* =========================================================
   5. UPDATE REQUEST STATUS
   PATCH /api/requests/spare-parts/:id/status
   PUT /api/requests/:id/status
   Protected (Owner Only)
========================================================= */
async function handleUpdateRequestStatus(req, res) {
    try {
        const rawId = req.params.id;
        const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10);
        const { status } = req.body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`
            });
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .input('status', sql.NVarChar(30), status)
            .query(`
                UPDATE dbo.spare_part_requests
                SET status = @status,
                    updated_at = SYSUTCDATETIME()
                WHERE id = @id;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Spare part request not found.'
            });
        }

        return res.json({
            success: true,
            message: `Request #${id} status updated to ${status}.`
        });

    } catch (err) {
        console.error('Update status error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to update request status.'
        });
    }
}

router.patch('/spare-parts/:id/status', requireOwnerAuth, handleUpdateRequestStatus);
router.patch('/:id/status', requireOwnerAuth, handleUpdateRequestStatus);
router.put('/:id/status', requireOwnerAuth, handleUpdateRequestStatus);

/* =========================================================
   6. DELETE REQUEST (OWNER ONLY)
   DELETE /api/requests/spare-parts/:id
   DELETE /api/requests/:id
   Protected (Owner Only)
========================================================= */
async function handleDeleteRequest(req, res) {
    try {
        const rawId = req.params.id;
        const numericId = parseInt(String(rawId).replace(/\D/g, ''), 10);
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .query(`
                DELETE FROM dbo.spare_part_requests
                WHERE id = @id;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Spare part request not found.'
            });
        }

        return res.json({
            success: true,
            message: `Spare part request #${id} deleted successfully.`
        });

    } catch (err) {
        console.error('Delete request error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete spare part request.'
        });
    }
}

router.delete('/spare-parts/:id', requireOwnerAuth, handleDeleteRequest);
router.delete('/:id', requireOwnerAuth, handleDeleteRequest);

module.exports = router;