const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'sai_srinivasa_automobiles_secret_key_2026';

async function requireOwnerAuth(req, res, next) {
    // 1. Check authentication cookie / header
    const token = req.cookies?.owner_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please log in.'
        });
    }

    try {
        // 2 & 3. Validate token and check expiry
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Identify user from payload
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication session token.'
            });
        }

        // 5 & 6. Verify that the user exists in SQL Server and role = owner
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, decoded.id)
            .query(`
                SELECT TOP 1 id, name, username, email, role
                FROM users
                WHERE id = @id AND role = 'owner'
            `);

        const dbUser = result.recordset[0];

        if (!dbUser) {
            res.clearCookie('owner_token');
            return res.status(401).json({
                success: false,
                error: 'Authentication failed: Owner account does not exist in SQL Server.'
            });
        }

        if (dbUser.role !== 'owner') {
            return res.status(403).json({
                success: false,
                error: 'Access forbidden. Owner permission required.'
            });
        }

        // 7. Attach verified authenticated user details to request
        req.user = {
            id: dbUser.id,
            name: dbUser.name,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role
        };

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired session token. Please log in again.'
        });
    }
}

module.exports = { requireOwnerAuth, JWT_SECRET };
