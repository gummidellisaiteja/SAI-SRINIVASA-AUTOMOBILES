'use strict';

const express = require('express');
const { poolPromise } = require('../config/db');
const { requireOwnerAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireOwnerAuth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM dbo.spare_part_requests) AS customerInquiries,
                (SELECT COUNT(*) FROM dbo.spare_part_requests WHERE status = 'Pending') AS pendingInquiries,
                (SELECT COUNT(*) FROM dbo.spare_part_requests WHERE status = 'Contacted') AS contactedInquiries,
                (SELECT COUNT(*) FROM dbo.spare_part_requests WHERE status = 'Available') AS availableInquiries,
                (SELECT COUNT(*) FROM dbo.spare_part_requests WHERE status = 'Completed') AS completedInquiries,
                (SELECT COUNT(*) FROM dbo.spare_part_requests WHERE vehicle_type = 'Tractor' AND status IN ('Pending', 'Contacted')) AS tractorWorksQueue,
                (SELECT COUNT(*) FROM dbo.spare_parts) AS totalPartsCatalogued,
                (SELECT COUNT(*) FROM dbo.spare_parts WHERE availability = 'Available') AS availableParts
        `);

        const row = result.recordset[0] || {};

        return res.json({
            success: true,
            data: {
                totalPartsCatalogued: Number(row.totalPartsCatalogued || 0),
                availableParts: Number(row.availableParts || 0),
                customerInquiries: Number(row.customerInquiries || 0),
                newInquiries: Number(row.pendingInquiries || 0),
                contactedInquiries: Number(row.contactedInquiries || 0),
                availableInquiries: Number(row.availableInquiries || 0),
                completedInquiries: Number(row.completedInquiries || 0),
                tractorWorksQueue: Number(row.tractorWorksQueue || 0),
                digitalVolume: 0
            }
        });
    } catch (err) {
        console.error('Dashboard stats error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to load dashboard statistics from SQL Server.'
        });
    }
});

module.exports = router;
