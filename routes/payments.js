const express = require('express');
const { requireOwnerAuth } = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   PAYMENTS API (STUB / AUTH PROTECTED)
========================================================= */
router.get('/', requireOwnerAuth, (req, res) => {
    return res.json({ success: true, data: [] });
});

module.exports = router;