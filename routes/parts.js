'use strict';

const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { requireOwnerAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_VEHICLE_TYPES = ['Two Wheeler', 'Four Wheeler', 'Tractor'];

function mapPartRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        telugu_name: row.telugu_name,
        vehicle_type: row.vehicle_type,
        category: row.category,
        compatible_models: row.compatible_models,
        description: row.description,
        price: row.price,
        availability: row.availability,
        image_url: row.image_url,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
}

function parsePartPayload(body) {
    const name = (body.name || body.part_name || '').trim();
    const teluguName = (body.telugu_name || body.teluguName || '').trim();
    const vehicleType = (body.vehicle_type || body.vehicleType || body.vehicle || '').trim();
    const category = (body.category || 'Other').trim() || 'Other';
    const compatible = (body.compatible_models || body.compatibleModels || body.compatible || '').trim();
    const description = (body.description || body.desc || '').trim();
    const price = (body.price || 'Contact Shop').trim() || 'Contact Shop';
    const availability = (body.availability || 'Available').trim() || 'Available';
    const imageUrl = body.image_url || body.imageUrl || body.image || null;

    return { name, teluguName, vehicleType, category, compatible, description, price, availability, imageUrl };
}

/* =========================================================
   GET /api/parts  — public catalog + owner inventory
========================================================= */
router.get('/', async (req, res) => {
    try {
        const { vehicle, search } = req.query;
        const pool = await poolPromise;
        const requestQuery = pool.request();

        let sqlQuery = `
            SELECT
                id, name, telugu_name, vehicle_type, category, compatible_models,
                description, price, availability, image_url, created_at, updated_at
            FROM dbo.spare_parts
            WHERE 1=1
        `;

        if (vehicle && vehicle !== 'All') {
            requestQuery.input('vehicle_type', sql.NVarChar(50), vehicle);
            sqlQuery += ` AND vehicle_type = @vehicle_type`;
        }

        if (search && String(search).trim()) {
            requestQuery.input('search', sql.NVarChar(200), `%${String(search).trim()}%`);
            sqlQuery += ` AND (
                name LIKE @search
                OR telugu_name LIKE @search
                OR category LIKE @search
                OR compatible_models LIKE @search
                OR description LIKE @search
            )`;
        }

        sqlQuery += ` ORDER BY created_at DESC`;

        const result = await requestQuery.query(sqlQuery);
        const parts = result.recordset.map(mapPartRow);

        return res.json({
            success: true,
            count: parts.length,
            data: parts,
            parts
        });
    } catch (err) {
        console.error('Get parts error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to load spare parts from the database.'
        });
    }
});

/* =========================================================
   GET /api/parts/:id
========================================================= */
router.get('/:id', async (req, res) => {
    try {
        const numericId = parseInt(req.params.id, 10);
        if (!numericId) {
            return res.status(400).json({ success: false, error: 'Invalid spare part id.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .query(`
                SELECT TOP 1
                    id, name, telugu_name, vehicle_type, category, compatible_models,
                    description, price, availability, image_url, created_at, updated_at
                FROM dbo.spare_parts
                WHERE id = @id
            `);

        const row = result.recordset[0];
        if (!row) {
            return res.status(404).json({ success: false, error: 'Spare part not found.' });
        }

        return res.json({ success: true, data: mapPartRow(row) });
    } catch (err) {
        console.error('Get part by id error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to retrieve spare part.' });
    }
});

/* =========================================================
   POST /api/parts — owner only
========================================================= */
router.post('/', requireOwnerAuth, async (req, res) => {
    try {
        const payload = parsePartPayload(req.body);

        if (!payload.name) {
            return res.status(400).json({ success: false, error: 'Part name is required.' });
        }
        if (!payload.vehicleType || !VALID_VEHICLE_TYPES.includes(payload.vehicleType)) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle type must be Two Wheeler, Four Wheeler, or Tractor.'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar(200), payload.name)
            .input('telugu_name', sql.NVarChar(200), payload.teluguName || null)
            .input('vehicle_type', sql.NVarChar(50), payload.vehicleType)
            .input('category', sql.NVarChar(100), payload.category)
            .input('compatible_models', sql.NVarChar(500), payload.compatible || null)
            .input('description', sql.NVarChar(sql.MAX), payload.description || null)
            .input('price', sql.NVarChar(100), payload.price)
            .input('availability', sql.NVarChar(50), payload.availability)
            .input('image_url', sql.NVarChar(sql.MAX), payload.imageUrl || null)
            .query(`
                INSERT INTO dbo.spare_parts (
                    name, telugu_name, vehicle_type, category, compatible_models,
                    description, price, availability, image_url, created_at, updated_at
                )
                OUTPUT INSERTED.id
                VALUES (
                    @name, @telugu_name, @vehicle_type, @category, @compatible_models,
                    @description, @price, @availability, @image_url, SYSUTCDATETIME(), SYSUTCDATETIME()
                );
            `);

        const newId = result.recordset[0]?.id;
        return res.status(201).json({
            success: true,
            message: 'Spare part added to inventory.',
            id: newId
        });
    } catch (err) {
        console.error('Create part error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to save spare part to the database.' });
    }
});

/* =========================================================
   PUT /api/parts/:id — owner only
========================================================= */
router.put('/:id', requireOwnerAuth, async (req, res) => {
    try {
        const numericId = parseInt(req.params.id, 10);
        if (!numericId) {
            return res.status(400).json({ success: false, error: 'Invalid spare part id.' });
        }

        const payload = parsePartPayload(req.body);
        if (!payload.name) {
            return res.status(400).json({ success: false, error: 'Part name is required.' });
        }
        if (!payload.vehicleType || !VALID_VEHICLE_TYPES.includes(payload.vehicleType)) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle type must be Two Wheeler, Four Wheeler, or Tractor.'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .input('name', sql.NVarChar(200), payload.name)
            .input('telugu_name', sql.NVarChar(200), payload.teluguName || null)
            .input('vehicle_type', sql.NVarChar(50), payload.vehicleType)
            .input('category', sql.NVarChar(100), payload.category)
            .input('compatible_models', sql.NVarChar(500), payload.compatible || null)
            .input('description', sql.NVarChar(sql.MAX), payload.description || null)
            .input('price', sql.NVarChar(100), payload.price)
            .input('availability', sql.NVarChar(50), payload.availability)
            .input('image_url', sql.NVarChar(sql.MAX), payload.imageUrl || null)
            .query(`
                UPDATE dbo.spare_parts
                SET name = @name,
                    telugu_name = @telugu_name,
                    vehicle_type = @vehicle_type,
                    category = @category,
                    compatible_models = @compatible_models,
                    description = @description,
                    price = @price,
                    availability = @availability,
                    image_url = @image_url,
                    updated_at = SYSUTCDATETIME()
                WHERE id = @id;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, error: 'Spare part not found.' });
        }

        return res.json({ success: true, message: 'Spare part updated successfully.' });
    } catch (err) {
        console.error('Update part error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to update spare part.' });
    }
});

/* =========================================================
   DELETE /api/parts/:id — owner only
========================================================= */
router.delete('/:id', requireOwnerAuth, async (req, res) => {
    try {
        const numericId = parseInt(req.params.id, 10);
        if (!numericId) {
            return res.status(400).json({ success: false, error: 'Invalid spare part id.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, numericId)
            .query(`DELETE FROM dbo.spare_parts WHERE id = @id;`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, error: 'Spare part not found.' });
        }

        return res.json({ success: true, message: 'Spare part deleted from inventory.' });
    } catch (err) {
        console.error('Delete part error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to delete spare part.' });
    }
});

module.exports = router;
