'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');

const { sql, poolPromise }       = require('../config/db');
const { requireOwnerAuth, JWT_SECRET } = require('../middleware/auth');

let sendPasswordResetEmail;
try {
    sendPasswordResetEmail = require('../config/mailer').sendPasswordResetEmail;
} catch (e) {
    sendPasswordResetEmail = null;
}

const router = express.Router();

/* ================================================================
   CONSTANTS
================================================================ */
const RESET_CODE_EXPIRY_MS   = 10 * 60 * 1000;  // 10 minutes
const RESET_MAX_ATTEMPTS     = 5;
const RESET_SESSION_EXPIRY_S = 15 * 60;          // 15 minutes (JWT)
const BCRYPT_ROUNDS          = 12;
const IS_DEV = process.env.NODE_ENV !== 'production';

/* ================================================================
   HELPERS
================================================================ */
/** Generate a cryptographically secure 6-digit numeric code. */
function generateResetCode() {
    // crypto.randomInt(min, max) → [min, max)
    const code = crypto.randomInt(100000, 1000000);
    return String(code).padStart(6, '0');
}

/** Hash a reset code with SHA-256 (fast, fine for single-use short codes). */
function hashResetCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

/** Timing-safe constant-time comparison of two hex strings. */
function safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

/** Password strength validation (reused for setup, change password, and reset). */
function validatePasswordStrength(pwd) {
    const errors = [];
    if (!pwd || pwd.length < 8)       errors.push('At least 8 characters.');
    if (!/[A-Z]/.test(pwd))           errors.push('At least one uppercase letter.');
    if (!/[a-z]/.test(pwd))           errors.push('At least one lowercase letter.');
    if (!/[0-9]/.test(pwd))           errors.push('At least one number.');
    if (!/[^A-Za-z0-9]/.test(pwd))    errors.push('At least one special character.');
    return errors;
}

/** Dev-only console logging (never logs passwords or reset codes). */
function devLog(...args) {
    if (IS_DEV) console.log('[AUTH]', ...args);
}


/* ================================================================
   1. CHECK FIRST-TIME SETUP STATUS
   GET /api/auth/setup-status
   Public
================================================================ */
router.get('/setup-status', async (req, res) => {
    try {
        const pool   = await poolPromise;
        const result = await pool.request().query(`
            SELECT COUNT(*) AS ownerCount FROM users WHERE role = 'owner'
        `);
        const count        = result.recordset[0]?.ownerCount || 0;
        const setupRequired = (count === 0);
        return res.json({ success: true, setupRequired, ownerExists: !setupRequired });
    } catch (err) {
        console.error('[AUTH] setup-status error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to verify setup status.' });
    }
});


/* ================================================================
   2. FIRST-TIME OWNER SETUP
   POST /api/auth/setup
   Public — allowed ONLY when no owner exists
================================================================ */
router.post('/setup', async (req, res) => {
    try {
        const { name, username, email, password, confirmPassword } = req.body;

        if (!username || !username.trim() || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Password and Confirm Password do not match.' });
        }

        const pwErrors = validatePasswordStrength(password);
        if (pwErrors.length > 0) {
            return res.status(400).json({ success: false, error: pwErrors.join(' ') });
        }

        const pool = await poolPromise;

        const checkResult = await pool.request().query(`
            SELECT COUNT(*) AS ownerCount FROM users WHERE role = 'owner'
        `);
        if ((checkResult.recordset[0]?.ownerCount || 0) > 0) {
            return res.status(403).json({
                success: false,
                error: 'Owner setup is no longer available. An owner account already exists.'
            });
        }

        const passwordHash  = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const ownerName     = name && name.trim() ? name.trim() : 'RamBabu';
        const ownerUsername = username.trim();
        const ownerEmail    = email && email.trim() ? email.trim() : null;

        await pool.request()
            .input('name',          sql.NVarChar(100), ownerName)
            .input('username',      sql.NVarChar(100), ownerUsername)
            .input('email',         sql.NVarChar(255), ownerEmail)
            .input('password_hash', sql.NVarChar(255), passwordHash)
            .query(`
                INSERT INTO users (name, username, email, password_hash, role, created_at, updated_at)
                VALUES (@name, @username, @email, @password_hash, 'owner', SYSUTCDATETIME(), SYSUTCDATETIME())
            `);

        return res.status(201).json({
            success: true,
            message: 'Master owner account created successfully. Please log in.'
        });

    } catch (err) {
        console.error('[AUTH] Owner setup error:', err.message);
        if (err.number === 2627 || err.number === 2601) {
            return res.status(400).json({ success: false, error: 'Username is already taken.' });
        }
        return res.status(500).json({ success: false, error: 'Failed to complete owner setup.' });
    }
});


/* ================================================================
   3. OWNER LOGIN
   POST /api/auth/login
   Public (protected by rate limiter in server.js)
================================================================ */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        devLog('LOGIN ATTEMPT — username received:', username ? `"${username.trim()}"` : '(empty)');

        if (!username || !password) {
            devLog('LOGIN FAILED — missing username or password field');
            return res.status(400).json({ success: false, error: 'Username and password are required.' });
        }

        const trimmedUsername = username.trim();
        const pool = await poolPromise;

        const result = await pool.request()
            .input('username', sql.NVarChar(100), trimmedUsername)
            .query(`
                SELECT TOP 1
                    id, name, username, email, password_hash, role
                FROM users
                WHERE (username = @username OR email = @username)
                  AND role = 'owner'
            `);

        const user = result.recordset[0];

        devLog('DATABASE LOOKUP —', user ? `FOUND (id=${user.id}, role=${user.role})` : 'NOT FOUND');

        if (!user || !user.password_hash) {
            devLog('LOGIN FAILED — user not found or password_hash missing');
            return res.status(401).json({ success: false, error: 'Invalid username or password.' });
        }

        devLog('PASSWORD HASH EXISTS —', user.password_hash ? 'YES' : 'NO');
        devLog('HASH LENGTH —', user.password_hash ? user.password_hash.length : 0);

        // bcrypt.compare — DO NOT trim the password (spaces are valid)
        const isValid = await bcrypt.compare(password, user.password_hash);

        devLog('BCRYPT RESULT —', isValid ? 'SUCCESS' : 'FAILED');
        devLog('LOGIN RESULT —', isValid ? 'SUCCESS' : 'FAILED');

        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            {
                id:       user.id,
                name:     user.name,
                username: user.username,
                email:    user.email,
                role:     user.role || 'owner'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('owner_token', token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge:   24 * 60 * 60 * 1000
        });

        // NEVER return password_hash
        return res.json({
            success: true,
            message: 'Owner login successful.',
            token,
            user: {
                id:       user.id,
                name:     user.name,
                username: user.username,
                email:    user.email,
                role:     user.role
            }
        });

    } catch (err) {
        console.error('[AUTH] Login error:', err.message);
        return res.status(500).json({ success: false, error: 'Server authentication error.' });
    }
});


/* ================================================================
   4. LOGOUT
   POST /api/auth/logout
================================================================ */
router.post('/logout', (req, res) => {
    // Clear cookie with exact same attributes as when it was set
    res.clearCookie('owner_token', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    devLog('LOGOUT — cookie cleared');
    return res.json({ success: true, message: 'Logged out successfully.' });
});


/* ================================================================
   5. GET CURRENT USER PROFILE
   GET /api/auth/me
   Protected
================================================================ */
router.get('/me', requireOwnerAuth, async (req, res) => {
    try {
        const pool   = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query(`
                SELECT TOP 1 id, name, username, email, role, created_at, updated_at
                FROM users WHERE id = @id AND role = 'owner'
            `);

        const user = result.recordset[0];
        if (!user) {
            res.clearCookie('owner_token');
            return res.status(404).json({ success: false, error: 'Owner user not found.' });
        }

        return res.json({
            success:       true,
            authenticated: true,
            id:         user.id,
            name:       user.name,
            username:   user.username,
            email:      user.email,
            role:       user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            user: {
                id:       user.id,
                name:     user.name,
                username: user.username,
                email:    user.email,
                role:     user.role
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to retrieve owner profile.' });
    }
});


/* ================================================================
   6. UPDATE OWNER PROFILE (NAME & EMAIL)
   PUT /api/auth/profile
   Protected
================================================================ */
router.put('/profile', requireOwnerAuth, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'Owner full name is required.' });
        }
        if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ success: false, error: 'Invalid email format.' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id',    sql.Int,         req.user.id)
            .input('name',  sql.NVarChar(100), name.trim())
            .input('email', sql.NVarChar(255), email ? email.trim() : null)
            .query(`
                UPDATE users SET name = @name, email = @email, updated_at = SYSUTCDATETIME()
                WHERE id = @id AND role = 'owner'
            `);

        return res.json({ success: true, message: 'Owner profile updated successfully.' });

    } catch (err) {
        console.error('[AUTH] Update profile error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to update owner profile.' });
    }
});


/* ================================================================
   7. CHANGE USERNAME
   PUT /api/auth/username
   Protected
================================================================ */
router.put('/username', requireOwnerAuth, async (req, res) => {
    try {
        const { currentPassword, newUsername } = req.body;

        if (!currentPassword || !newUsername) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new username are required.'
            });
        }

        const trimmedUsername = newUsername.trim();
        if (trimmedUsername.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'New username must be at least 3 characters long.'
            });
        }

        const pool = await poolPromise;

        const userResult = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query(`SELECT TOP 1 id, password_hash FROM users WHERE id = @id AND role = 'owner'`);

        const user = userResult.recordset[0];
        if (!user) return res.status(404).json({ success: false, error: 'Owner account not found.' });

        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                error: 'Verification failed. Incorrect current password.'
            });
        }

        const duplicateCheck = await pool.request()
            .input('newUsername', sql.NVarChar(100), trimmedUsername)
            .input('id',          sql.Int,           req.user.id)
            .query(`SELECT TOP 1 id FROM users WHERE username = @newUsername AND id != @id`);

        if (duplicateCheck.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Username is already taken. Please choose a different username.'
            });
        }

        await pool.request()
            .input('id',          sql.Int,           req.user.id)
            .input('newUsername', sql.NVarChar(100), trimmedUsername)
            .query(`
                UPDATE users SET username = @newUsername, updated_at = SYSUTCDATETIME()
                WHERE id = @id AND role = 'owner'
            `);

        // Invalidate session
        res.clearCookie('owner_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

        return res.json({
            success: true,
            message: 'Username changed successfully. Please log in again using your new username.'
        });

    } catch (err) {
        console.error('[AUTH] Change username error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to change username.' });
    }
});


/* ================================================================
   8. CHANGE PASSWORD
   PUT /api/auth/password
   Protected
================================================================ */
router.put('/password', requireOwnerAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password, new password, and confirm password are required.'
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'New password and confirm password do not match.' });
        }
        if (newPassword === currentPassword) {
            return res.status(400).json({ success: false, error: 'New password must be different from current password.' });
        }

        const pwErrors = validatePasswordStrength(newPassword);
        if (pwErrors.length > 0) {
            return res.status(400).json({ success: false, error: pwErrors.join(' ') });
        }

        const pool = await poolPromise;
        const userResult = await pool.request()
            .input('id', sql.Int, req.user.id)
            .query(`SELECT TOP 1 id, password_hash FROM users WHERE id = @id AND role = 'owner'`);

        const user = userResult.recordset[0];
        if (!user) return res.status(404).json({ success: false, error: 'Owner account not found.' });

        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                error: 'Verification failed. Incorrect current password.'
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        await pool.request()
            .input('id',              sql.Int,           req.user.id)
            .input('newPasswordHash', sql.NVarChar(255), newPasswordHash)
            .query(`
                UPDATE users SET password_hash = @newPasswordHash, updated_at = SYSUTCDATETIME()
                WHERE id = @id AND role = 'owner'
            `);

        // Invalidate session
        res.clearCookie('owner_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

        return res.json({
            success: true,
            message: 'Password changed successfully. Please log in again using your new password.'
        });

    } catch (err) {
        console.error('[AUTH] Change password error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to change password.' });
    }
});


/* ================================================================
   9. FORGOT PASSWORD — REQUEST RESET CODE
   POST /api/auth/forgot-password
   Public
================================================================ */
router.post('/forgot-password', async (req, res) => {
    // Always return generic response to prevent email enumeration
    const GENERIC_RESPONSE = {
        success: true,
        message: 'If the email is registered, a password reset code has been sent.'
    };

    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, error: 'Email address is required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const pool = await poolPromise;

        // Look up user by email
        const userResult = await pool.request()
            .input('email', sql.NVarChar(255), normalizedEmail)
            .query(`
                SELECT TOP 1 id, name, email FROM users
                WHERE LOWER(email) = @email AND role = 'owner'
            `);

        const user = userResult.recordset[0];

        if (!user) {
            devLog('FORGOT PASSWORD — email not found in DB (generic response returned)');
            return res.json(GENERIC_RESPONSE); // Do NOT reveal email doesn't exist
        }

        // Invalidate any previous unused reset requests for this user
        await pool.request()
            .input('user_id', sql.Int, user.id)
            .query(`
                DELETE FROM password_reset_tokens
                WHERE user_id = @user_id AND used_at IS NULL
            `);

        // Generate a cryptographically secure 6-digit code
        const code     = generateResetCode();
        const codeHash = hashResetCode(code);
        const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY_MS);

        await pool.request()
            .input('user_id',    sql.Int,        user.id)
            .input('token_hash', sql.NVarChar(255), codeHash)
            .input('expires_at', sql.DateTime2,  expiresAt)
            .query(`
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, attempts, created_at)
                VALUES (@user_id, @token_hash, @expires_at, 0, SYSUTCDATETIME())
            `);

        // Send email — if SMTP is not configured in dev, log code to console instead
        if (sendPasswordResetEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
            try {
                await sendPasswordResetEmail(user.email, code);
                devLog('FORGOT PASSWORD — reset email sent to:', user.email);
            } catch (mailErr) {
                console.error('[AUTH] Failed to send reset email:', mailErr.message);
                // Still return generic success — don't reveal email send failure
            }
        } else {
            // Development fallback: print code to server console ONLY
            console.log('');
            console.log('='.repeat(60));
            console.log(' [DEV] SMTP NOT CONFIGURED — Password Reset Code:');
            console.log(' Code    :', code);
            console.log(' For user:', user.email);
            console.log(' Expires :', expiresAt.toISOString());
            console.log(' Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env');
            console.log('='.repeat(60));
            console.log('');
        }

        return res.json(GENERIC_RESPONSE);

    } catch (err) {
        console.error('[AUTH] Forgot password error:', err.message);
        // Return generic response even on error
        return res.json(GENERIC_RESPONSE);
    }
});


/* ================================================================
   10. VERIFY RESET CODE
   POST /api/auth/verify-reset-code
   Public
================================================================ */
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !email.trim() || !code || !code.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Email and verification code are required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedCode  = code.trim();

        // Basic code format check (6 digits)
        if (!/^\d{6}$/.test(normalizedCode)) {
            return res.status(400).json({
                success: false,
                error: 'Verification code must be a 6-digit number.'
            });
        }

        const pool = await poolPromise;

        // Find user by email
        const userResult = await pool.request()
            .input('email', sql.NVarChar(255), normalizedEmail)
            .query(`
                SELECT TOP 1 id FROM users
                WHERE LOWER(email) = @email AND role = 'owner'
            `);

        const user = userResult.recordset[0];
        if (!user) {
            devLog('VERIFY RESET CODE — user not found');
            return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
        }

        // Get the latest unused reset token for this user
        const tokenResult = await pool.request()
            .input('user_id', sql.Int, user.id)
            .query(`
                SELECT TOP 1 id, token_hash, expires_at, attempts, used_at
                FROM password_reset_tokens
                WHERE user_id = @user_id AND used_at IS NULL
                ORDER BY created_at DESC
            `);

        const tokenRecord = tokenResult.recordset[0];

        if (!tokenRecord) {
            devLog('VERIFY RESET CODE — no active reset token found');
            return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
        }

        // Check expiration
        if (new Date() > new Date(tokenRecord.expires_at)) {
            devLog('VERIFY RESET CODE — token expired');
            return res.status(400).json({ success: false, error: 'Reset code has expired. Please request a new code.' });
        }

        // Check attempt limit
        if (tokenRecord.attempts >= RESET_MAX_ATTEMPTS) {
            devLog('VERIFY RESET CODE — max attempts exceeded, invalidating token');
            // Invalidate this token
            await pool.request()
                .input('id', sql.Int, tokenRecord.id)
                .query(`UPDATE password_reset_tokens SET used_at = SYSUTCDATETIME() WHERE id = @id`);
            return res.status(400).json({
                success: false,
                error: 'Too many incorrect attempts. Please request a new code.'
            });
        }

        // Compare code hash (timing-safe)
        const submittedHash = hashResetCode(normalizedCode);
        const codeMatches   = safeCompare(submittedHash, tokenRecord.token_hash);

        if (!codeMatches) {
            // Increment attempt counter
            await pool.request()
                .input('id', sql.Int, tokenRecord.id)
                .query(`UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = @id`);
            devLog('VERIFY RESET CODE — code mismatch, attempts incremented');
            return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
        }

        devLog('VERIFY RESET CODE — SUCCESS');

        // Issue a short-lived, single-use password-reset authorization JWT
        // This token is NOT a normal login session — it can ONLY be used to reset the password.
        const resetAuthToken = jwt.sign(
            {
                sub:     user.id,
                purpose: 'password_reset',
                tokenId: tokenRecord.id
            },
            JWT_SECRET + '_reset',  // Distinct secret suffix so reset tokens ≠ login tokens
            { expiresIn: `${RESET_SESSION_EXPIRY_S}s` }
        );

        return res.json({
            success: true,
            message: 'Code verified. Please set your new password.',
            resetToken: resetAuthToken
        });

    } catch (err) {
        console.error('[AUTH] Verify reset code error:', err.message);
        return res.status(500).json({ success: false, error: 'Verification error. Please try again.' });
    }
});


/* ================================================================
   11. RESET PASSWORD — SET NEW PASSWORD
   POST /api/auth/reset-password
   Requires valid resetToken from /verify-reset-code
================================================================ */
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword, confirmPassword } = req.body;

        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Reset token, new password, and confirm password are required.'
            });
        }

        // Verify the short-lived reset authorization token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET + '_reset');
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                error: 'Reset session expired or invalid. Please request a new code.'
            });
        }

        if (!decoded || decoded.purpose !== 'password_reset' || !decoded.sub || !decoded.tokenId) {
            return res.status(401).json({
                success: false,
                error: 'Invalid reset session. Please request a new code.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match.' });
        }

        const pwErrors = validatePasswordStrength(newPassword);
        if (pwErrors.length > 0) {
            return res.status(400).json({ success: false, error: pwErrors.join(' ') });
        }

        const pool = await poolPromise;

        // Verify the token record still exists and hasn't been used
        const tokenResult = await pool.request()
            .input('id',      sql.Int, decoded.tokenId)
            .input('user_id', sql.Int, decoded.sub)
            .query(`
                SELECT TOP 1 id, used_at, expires_at
                FROM password_reset_tokens
                WHERE id = @id AND user_id = @user_id
            `);

        const tokenRecord = tokenResult.recordset[0];

        if (!tokenRecord) {
            return res.status(401).json({ success: false, error: 'Invalid reset session. Please request a new code.' });
        }
        if (tokenRecord.used_at) {
            return res.status(401).json({ success: false, error: 'This reset code has already been used. Please request a new one.' });
        }
        if (new Date() > new Date(tokenRecord.expires_at)) {
            return res.status(401).json({ success: false, error: 'Reset session expired. Please request a new code.' });
        }

        // Hash the new password
        const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Update password_hash in users table
        await pool.request()
            .input('id',   sql.Int,           decoded.sub)
            .input('hash', sql.NVarChar(255), newHash)
            .query(`
                UPDATE users SET password_hash = @hash, updated_at = SYSUTCDATETIME()
                WHERE id = @id AND role = 'owner'
            `);

        // Mark reset token as used (single-use)
        await pool.request()
            .input('id', sql.Int, decoded.tokenId)
            .query(`UPDATE password_reset_tokens SET used_at = SYSUTCDATETIME() WHERE id = @id`);

        // Invalidate any login session cookie if present
        res.clearCookie('owner_token', {
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        devLog('RESET PASSWORD — password updated for user id:', decoded.sub);

        return res.json({
            success: true,
            message: 'Password updated successfully. Please log in with your new password.'
        });

    } catch (err) {
        console.error('[AUTH] Reset password error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to reset password. Please try again.' });
    }
});


module.exports = router;
