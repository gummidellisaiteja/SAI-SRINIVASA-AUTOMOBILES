/**
 * DIAGNOSTIC: Test login API directly
 * Tests the full HTTP login flow.
 * Run: node scratch/test_login_api.js
 */
const BASE = 'http://localhost:5000';

async function test(username, password, expectedStatus, label) {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        redirect: 'manual'
    });
    const body = await res.json();
    const ok = res.status === expectedStatus;
    console.log(`${ok ? '✅' : '❌'} [${label}] HTTP ${res.status} — ${JSON.stringify(body).slice(0, 120)}`);
    return { status: res.status, body, ok };
}

async function main() {
    console.log('Testing Login API...\n');

    // Test wrong username
    await test('wronguser',  'any',          401, 'Wrong username');

    // Test wrong password with correct username
    await test('rambabu',    'wrongpass',    401, 'Wrong password');

    // Test with old known test password
    await test('rambabu', 'OwnerPass123!',   401, 'Old test password (should fail - hash mismatch)');

    // Test with email lookup
    await test('rambabu@saisrinivasa.com', 'OwnerPass123!', 401, 'Email login (old password, should fail)');

    // Check setup status
    const r = await fetch(`${BASE}/api/auth/setup-status`);
    console.log('\nSetup status:', await r.json());

    // Check /api/auth/me without cookie → should be 401
    const me = await fetch(`${BASE}/api/auth/me`);
    console.log(`/api/auth/me (no cookie) → ${me.status} (expected 401)`);

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
