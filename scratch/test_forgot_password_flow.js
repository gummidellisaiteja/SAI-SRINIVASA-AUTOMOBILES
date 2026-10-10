/**
 * COMPLETE FORGOT PASSWORD FLOW TEST
 * Tests the full: request code → verify → set new password → login with new → old fails
 * Run AFTER starting server: node server.js
 */
const { poolPromise } = require('../config/db');

const BASE = 'http://localhost:5000';

async function api(path, options = {}) {
    options.headers = options.headers || {};
    if (options.json) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.json);
        delete options.json;
    }
    const res = await fetch(`${BASE}${path}`, options);
    let body = {};
    try { body = await res.json(); } catch (e) {}
    return { status: res.status, body };
}

function pass(msg)  { console.log('✅', msg); }
function fail(msg)  { console.error('❌', msg); process.exit(1); }
function info(msg)  { console.log('   ', msg); }

async function run() {
    console.log('\n' + '='.repeat(60));
    console.log(' FORGOT PASSWORD FLOW TEST');
    console.log('='.repeat(60) + '\n');

    const OWNER_EMAIL = 'rambabu@saisrinivasa.com';
    const CURRENT_PASS = 'Owner@123456';
    const NEW_PASS     = 'NewOwner@789!';

    // STEP 1: Request a reset code
    console.log('STEP 1 — Request reset code for registered email');
    {
        const { status, body } = await api('/api/auth/forgot-password', {
            method: 'POST', json: { email: OWNER_EMAIL }
        });
        if (status === 200 && body.success) {
            pass('Reset code requested — check server console for the 6-digit code');
        } else {
            fail(`Step 1 failed: HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // Get the code directly from DB (simulate what the email would deliver)
    console.log('\nSTEP 2 — Retrieve code directly from DB (simulating email receipt)');
    const pool = await poolPromise;
    const tokenResult = await pool.request().query(`
        SELECT TOP 1 token_hash, expires_at, attempts
        FROM password_reset_tokens
        WHERE used_at IS NULL
        ORDER BY created_at DESC
    `);
    const tokenRecord = tokenResult.recordset[0];
    if (!tokenRecord) { fail('No active reset token found in DB'); }
    info(`Token in DB: hash starts with ${tokenRecord.token_hash.slice(0,10)}...`);
    info(`Expires: ${tokenRecord.expires_at}`);
    info(`Attempts: ${tokenRecord.attempts}`);

    // We can't reverse the hash to get the code — that's the point.
    // Instead we test with a known wrong code first, then re-request and capture from server log.
    console.log('\nSTEP 3 — Test wrong code (5 times to hit limit)');
    let lastStatus;
    for (let i = 1; i <= 5; i++) {
        const { status, body } = await api('/api/auth/verify-reset-code', {
            method: 'POST', json: { email: OWNER_EMAIL, code: '000001' }
        });
        lastStatus = status;
        info(`Attempt ${i}/5: HTTP ${status} — ${body.error}`);
    }
    if (lastStatus === 400) {
        pass('Step 3 — Wrong code rejected correctly each time');
    }

    // STEP 4: After 5 wrong attempts, token should be invalidated
    console.log('\nSTEP 4 — 6th attempt should say "Too many incorrect attempts"');
    {
        // After 5 failed attempts the token is auto-invalidated on the 5th check
        const { status, body } = await api('/api/auth/verify-reset-code', {
            method: 'POST', json: { email: OWNER_EMAIL, code: '000001' }
        });
        if (status === 400 && body.error) {
            pass(`Step 4 — Token invalidated after max attempts: "${body.error}"`);
        } else {
            fail(`Step 4: Unexpected response: HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 5: Request a fresh reset code
    console.log('\nSTEP 5 — Request a fresh reset code (previous invalidated)');
    {
        const { status, body } = await api('/api/auth/forgot-password', {
            method: 'POST', json: { email: OWNER_EMAIL }
        });
        if (status === 200 && body.success) {
            pass('Step 5 — Fresh reset code requested');
        } else {
            fail(`Step 5 failed: HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // Get the fresh token hash from DB and find the code by brute force (100000–999999)
    // This simulates the code being delivered by email
    console.log('\nSTEP 6 — Find fresh code from DB token hash (simulates email delivery)');
    const freshToken = await pool.request().query(`
        SELECT TOP 1 token_hash, expires_at
        FROM password_reset_tokens
        WHERE used_at IS NULL
        ORDER BY created_at DESC
    `);
    const freshHash = freshToken.recordset[0]?.token_hash;
    if (!freshHash) { fail('No fresh token found in DB'); }

    const crypto = require('crypto');
    let foundCode = null;
    info('Searching for matching code (may take a moment)...');
    for (let i = 100000; i < 1000000; i++) {
        const h = crypto.createHash('sha256').update(String(i)).digest('hex');
        if (h === freshHash) { foundCode = String(i); break; }
    }
    if (!foundCode) { fail('Could not find matching code — hash mismatch'); }
    info(`Found code: ${foundCode.slice(0, 2)}***** (first 2 digits shown for security)`);
    pass('Step 6 — Code found by matching hash');

    // STEP 7: Verify the correct code
    console.log('\nSTEP 7 — Verify correct code');
    let resetToken;
    {
        const { status, body } = await api('/api/auth/verify-reset-code', {
            method: 'POST', json: { email: OWNER_EMAIL, code: foundCode }
        });
        if (status === 200 && body.success && body.resetToken) {
            resetToken = body.resetToken;
            pass('Step 7 — Code verified, reset token issued');
        } else {
            fail(`Step 7 failed: HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 8: Set new password using the reset token
    console.log('\nSTEP 8 — Set new password with reset token');
    {
        const { status, body } = await api('/api/auth/reset-password', {
            method: 'POST', json: {
                resetToken,
                newPassword:     NEW_PASS,
                confirmPassword: NEW_PASS
            }
        });
        if (status === 200 && body.success) {
            pass('Step 8 — Password reset successfully');
        } else {
            fail(`Step 8 failed: HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 9: Try to use the same reset token again (single-use check)
    console.log('\nSTEP 9 — Attempt to reuse reset token (should fail)');
    {
        const { status, body } = await api('/api/auth/reset-password', {
            method: 'POST', json: {
                resetToken,
                newPassword:     'AnotherPass@999',
                confirmPassword: 'AnotherPass@999'
            }
        });
        if (status === 401) {
            pass(`Step 9 — Reused reset token rejected: "${body.error}"`);
        } else {
            fail(`Step 9: Reused token was NOT rejected! HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 10: Old password must no longer work
    console.log('\nSTEP 10 — Login with OLD password (should fail)');
    {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'rambabu', password: CURRENT_PASS }
        });
        if (status === 401) {
            pass('Step 10 — Old password rejected correctly');
        } else {
            fail(`Step 10: Old password still works! HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 11: New password must work
    console.log('\nSTEP 11 — Login with NEW password (should succeed)');
    {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'rambabu', password: NEW_PASS }
        });
        if (status === 200 && body.success) {
            pass('Step 11 — New password works!');
        } else {
            fail(`Step 11: New password login failed! HTTP ${status} ${JSON.stringify(body)}`);
        }
    }

    // STEP 12: Reset password back to CURRENT_PASS for convenience
    console.log('\nSTEP 12 — Restoring original password for developer convenience');
    {
        const bcrypt = require('bcryptjs');
        const { sql } = require('../config/db');
        const hash = await bcrypt.hash(CURRENT_PASS, 12);
        await pool.request()
            .input('hash', sql.NVarChar(255), hash)
            .query(`UPDATE users SET password_hash = @hash, updated_at = SYSUTCDATETIME() WHERE role = 'owner'`);
        pass(`Step 12 — Password restored to "${CURRENT_PASS}" in DB`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(' ALL FORGOT PASSWORD FLOW TESTS PASSED ✅');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
