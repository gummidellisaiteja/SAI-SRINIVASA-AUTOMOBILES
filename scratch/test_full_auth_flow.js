/**
 * FULL AUTH FLOW TEST
 * Tests: Login → /me → Logout → Login again → Forgot Password → Verify → Reset
 * Run: node scratch/test_full_auth_flow.js
 */
const BASE = 'http://localhost:5000';

let cookieJar = '';

async function api(path, options = {}) {
    options.headers = options.headers || {};
    if (cookieJar) options.headers['Cookie'] = cookieJar;
    if (options.json) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.json);
        delete options.json;
    }
    const res = await fetch(`${BASE}${path}`, options);
    // Capture Set-Cookie
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookieJar = setCookie.split(';')[0];
    let body = {};
    try { body = await res.json(); } catch (e) {}
    return { status: res.status, body };
}

function pass(msg)  { console.log('✅', msg); }
function fail(msg)  { console.error('❌', msg); process.exit(1); }
function info(msg)  { console.log('   ', msg); }

async function run() {
    console.log('\n' + '='.repeat(60));
    console.log(' FULL AUTH FLOW TEST — SAI SRINIVASA AUTOMOBILES');
    console.log('='.repeat(60) + '\n');

    // TEST 1: Login with correct credentials
    {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'rambabu', password: 'Owner@123456' }
        });
        if (status === 200 && body.success) {
            pass('TEST 1 — Login with correct credentials');
            info(`User: ${body.user?.name} (${body.user?.username})`);
        } else {
            fail(`TEST 1 FAILED — HTTP ${status}: ${body.error}`);
        }
    }

    // TEST 2: /api/auth/me while logged in
    {
        const { status, body } = await api('/api/auth/me');
        if (status === 200 && body.authenticated) {
            pass('TEST 2 — /api/auth/me returns authenticated while logged in');
        } else {
            fail(`TEST 2 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 3: Logout
    {
        const { status, body } = await api('/api/auth/logout', { method: 'POST' });
        if (status === 200 && body.success) {
            pass('TEST 3 — Logout successful');
            cookieJar = ''; // Clear local cookie
        } else {
            fail(`TEST 3 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 4: /api/auth/me after logout (should be 401)
    {
        const { status } = await api('/api/auth/me');
        if (status === 401) {
            pass('TEST 4 — /api/auth/me returns 401 after logout');
        } else {
            fail(`TEST 4 FAILED — HTTP ${status} (expected 401 after logout)`);
        }
    }

    // TEST 5: Login AGAIN after logout
    {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'rambabu', password: 'Owner@123456' }
        });
        if (status === 200 && body.success) {
            pass('TEST 5 — Login AGAIN after logout works');
        } else {
            fail(`TEST 5 FAILED — HTTP ${status}: ${body.error}`);
        }
    }

    // TEST 6: Wrong password
    {
        cookieJar = '';
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'rambabu', password: 'WrongPass999!' }
        });
        if (status === 401 && body.error === 'Invalid username or password.') {
            pass('TEST 6 — Wrong password → generic "Invalid username or password."');
        } else {
            fail(`TEST 6 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 7: Wrong username
    {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST', json: { username: 'nonexistent', password: 'anything' }
        });
        if (status === 401 && body.error === 'Invalid username or password.') {
            pass('TEST 7 — Wrong username → generic "Invalid username or password."');
        } else {
            fail(`TEST 7 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 8: Forgot Password — registered email (generic response regardless)
    {
        const { status, body } = await api('/api/auth/forgot-password', {
            method: 'POST', json: { email: 'rambabu@saisrinivasa.com' }
        });
        if (status === 200 && body.success) {
            pass('TEST 8 — Forgot Password (registered email) → generic success response');
            info('Check server console for the 6-digit code (SMTP not configured in dev)');
        } else {
            fail(`TEST 8 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 9: Forgot Password — unregistered email (same generic response)
    {
        const { status, body } = await api('/api/auth/forgot-password', {
            method: 'POST', json: { email: 'notregistered@example.com' }
        });
        if (status === 200 && body.success) {
            pass('TEST 9 — Forgot Password (unregistered email) → same generic response (no enumeration)');
        } else {
            fail(`TEST 9 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 10: Verify code — wrong code
    {
        const { status, body } = await api('/api/auth/verify-reset-code', {
            method: 'POST', json: { email: 'rambabu@saisrinivasa.com', code: '000000' }
        });
        if (status === 400) {
            pass('TEST 10 — Wrong reset code rejected with 400');
        } else {
            fail(`TEST 10 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 11: Reset password without valid resetToken (should be rejected)
    {
        const { status, body } = await api('/api/auth/reset-password', {
            method: 'POST', json: {
                resetToken: 'fake.token.here',
                newPassword: 'NewPass@123',
                confirmPassword: 'NewPass@123'
            }
        });
        if (status === 401) {
            pass('TEST 11 — Reset password without valid token rejected with 401');
        } else {
            fail(`TEST 11 FAILED — HTTP ${status}: ${JSON.stringify(body)}`);
        }
    }

    // TEST 12: Password hash in DB must be 60 chars
    {
        const { poolPromise } = require('../config/db');
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT password_hash FROM users WHERE role = 'owner'
        `);
        const hash = result.recordset[0]?.password_hash;
        if (hash && hash.length === 60 && hash.startsWith('$2a$')) {
            pass(`TEST 12 — DB password_hash is ${hash.length} chars, valid bcrypt format`);
        } else {
            fail(`TEST 12 FAILED — Hash: "${hash?.slice(0, 20)}..." len=${hash?.length}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(' ALL TESTS PASSED ✅');
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error('TEST SUITE ERROR:', err); process.exit(1); });
