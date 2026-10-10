const express = require('express');
const { requireOwnerAuth } = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   PARTS API (STUB / AUTH PROTECTED)
   Returns empty catalog until spare parts table is implemented
========================================================= */
router.get('/', (req, res) => {
    return res.json({ success: true, data: [] });
});

router.get('/:id', (req, res) => {
    return res.status(404).json({ success: false, error: 'Spare part not found.' });
});

router.post('/', requireOwnerAuth, (req, res) => {
    return res.status(400).json({ success: false, error: 'Spare parts database table is not yet initialized.' });
});

router.put('/:id', requireOwnerAuth, (req, res) => {
    return res.status(400).json({ success: false, error: 'Spare parts database table is not yet initialized.' });
});

router.delete('/:id', requireOwnerAuth, (req, res) => {
    return res.status(400).json({ success: false, error: 'Spare parts database table is not yet initialized.' });
});

module.exports = router;