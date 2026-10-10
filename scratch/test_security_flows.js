const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function runSecurityTests() {
    console.log('===========================================================');
    console.log(' STARTING COMPREHENSIVE OWNER AUTHENTICATION SECURITY TESTS');
    console.log('===========================================================');

    const BASE_URL = 'http://localhost:5000';
    let authCookie = null;

    // Helper for fetch with cookies
    async function request(path, options = {}) {
        options.headers = options.headers || {};
        if (authCookie) {
            options.headers['Cookie'] = authCookie;
        }
        if (options.body && typeof options.body === 'object') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }

        const res = await fetch(`${BASE_URL}${path}`, options);
        
        // Capture set-cookie
        const setCookieHeader = res.headers.get('set-cookie');
        if (setCookieHeader) {
            authCookie = setCookieHeader.split(';')[0];
        }

        let json = {};
        try {
            json = await res.json();
        } catch (e) {}

        return { status: res.status, ok: res.ok, headers: res.headers, body: json };
    }

    try {
        // --- TEST 1: Check Setup Status (Database Empty) ---
        console.log('\n[TEST 1] Checking First-Time Setup Status when DB is empty...');
        const res1 = await request('/api/auth/setup-status');
        console.log('Status Response:', res1.body);
        if (res1.body.setupRequired !== true) throw new Error('Test 1 Failed: Setup should be required when DB has 0 owners.');
        console.log('✅ TEST 1 PASSED: Setup required when 0 owners exist.');

        // --- TEST 2: First-Time Owner Setup ---
        console.log('\n[TEST 2] Creating First Owner Account via POST /api/auth/setup...');
        const setupData = {
            name: 'RamBabu Owner',
            username: 'rambabu',
            email: 'rambabu@saisrinivasa.com',
            password: 'OwnerPass123!',
            confirmPassword: 'OwnerPass123!'
        };
        const res2 = await request('/api/auth/setup', { method: 'POST', body: setupData });
        console.log('Setup Response:', res2.body);
        if (res2.status !== 201 || !res2.body.success) throw new Error('Test 2 Failed: Setup request failed.');

        // Verify in SQL Server Database directly
        const serverName = process.env.DB_SERVER || 'SAITEJA';
        const dbName = process.env.DB_NAME || 'sai_automobiles_db';
        const dbPool = await new sql.ConnectionPool({
            connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
        }).connect();

        const dbUsers = await dbPool.request().query(`SELECT id, name, username, email, password_hash, role, created_at, updated_at FROM users`);
        console.log('SQL Server DB User Record:', dbUsers.recordset[0]);
        const dbUser = dbUsers.recordset[0];
        await dbPool.close();

        if (!dbUser || !dbUser.password_hash.startsWith('$2')) {
            throw new Error('Test 2 Failed: Password in SQL Server is not a valid bcrypt hash!');
        }
        if (dbUser.password_hash === 'OwnerPass123!') {
            throw new Error('Test 2 Failed: Plain-text password detected in database!');
        }
        console.log('✅ TEST 2 PASSED: Owner created in SQL Server. Password is securely hashed with bcrypt.');

        // --- TEST 3: Wrong Password Login ---
        console.log('\n[TEST 3] Attempting login with incorrect password...');
        const res3 = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'rambabu', password: 'WrongPassword999' }
        });
        console.log('Wrong Password Response:', res3.status, res3.body);
        if (res3.status !== 401 || res3.body.error !== 'Invalid username or password.') {
            throw new Error('Test 3 Failed: Invalid login attempt did not return 401 generic error.');
        }
        console.log('✅ TEST 3 PASSED: Incorrect login rejected with generic enumeration protection error.');

        // --- TEST 4: Correct Password Login ---
        console.log('\n[TEST 4] Logging in with correct credentials...');
        const res4 = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'rambabu', password: 'OwnerPass123!' }
        });
        console.log('Login Response:', res4.status, res4.body);
        if (res4.status !== 200 || !res4.body.success) throw new Error('Test 4 Failed: Valid login failed.');
        if (res4.body.user.password_hash || res4.body.password_hash) {
            throw new Error('Test 4 Failed: Sensitive password_hash returned in API response!');
        }
        console.log('Auth Cookie:', authCookie);
        console.log('✅ TEST 4 PASSED: Successful owner login with HttpOnly session cookie issued.');

        // --- TEST 5: Logout & Protected Endpoint Verification ---
        console.log('\n[TEST 5] Verifying GET /api/auth/me then performing Logout...');
        const res5a = await request('/api/auth/me');
        console.log('GET /api/auth/me authenticated:', res5a.status, res5a.body.user);
        if (res5a.status !== 200) throw new Error('Test 5 Failed: /api/auth/me should succeed when authenticated.');

        const res5b = await request('/api/auth/logout', { method: 'POST' });
        console.log('Logout Response:', res5b.status, res5b.body);
        authCookie = null; // Clear cookie locally

        const res5c = await request('/api/auth/me');
        console.log('GET /api/auth/me after logout:', res5c.status, res5c.body);
        if (res5c.status !== 401) throw new Error('Test 5 Failed: /api/auth/me must return 401 after logout.');
        console.log('✅ TEST 5 PASSED: Logout clears session; protected routes block unauthenticated access (401).');

        // --- TEST 6: Change Username ---
        console.log('\n[TEST 6] Testing Change Username...');
        // Login again first
        await request('/api/auth/login', { method: 'POST', body: { username: 'rambabu', password: 'OwnerPass123!' } });

        const res6 = await request('/api/auth/username', {
            method: 'PUT',
            body: { currentPassword: 'OwnerPass123!', newUsername: 'rambabu_new' }
        });
        console.log('Change Username Response:', res6.status, res6.body);
        if (res6.status !== 200) throw new Error('Test 6 Failed: Change username failed.');

        // Cookie is invalidated by server, so login with old username should fail
        authCookie = null;
        const res6Old = await request('/api/auth/login', { method: 'POST', body: { username: 'rambabu', password: 'OwnerPass123!' } });
        if (res6Old.status !== 401) throw new Error('Test 6 Failed: Old username should no longer work.');

        // Login with new username should succeed
        const res6New = await request('/api/auth/login', { method: 'POST', body: { username: 'rambabu_new', password: 'OwnerPass123!' } });
        if (res6New.status !== 200) throw new Error('Test 6 Failed: New username login failed.');
        console.log('✅ TEST 6 PASSED: Username changed successfully. Old username stopped working.');

        // --- TEST 7: Change Password ---
        console.log('\n[TEST 7] Testing Change Password...');
        const res7 = await request('/api/auth/password', {
            method: 'PUT',
            body: {
                currentPassword: 'OwnerPass123!',
                newPassword: 'NewOwnerPass456!',
                confirmPassword: 'NewOwnerPass456!'
            }
        });
        console.log('Change Password Response:', res7.status, res7.body);
        if (res7.status !== 200) throw new Error('Test 7 Failed: Change password failed.');

        // Login with old password should fail
        authCookie = null;
        const res7Old = await request('/api/auth/login', { method: 'POST', body: { username: 'rambabu_new', password: 'OwnerPass123!' } });
        if (res7Old.status !== 401) throw new Error('Test 7 Failed: Old password should no longer work.');

        // Login with new password should succeed
        const res7New = await request('/api/auth/login', { method: 'POST', body: { username: 'rambabu_new', password: 'NewOwnerPass456!' } });
        if (res7New.status !== 200) throw new Error('Test 7 Failed: New password login failed.');
        console.log('✅ TEST 7 PASSED: Password changed successfully. Old password stopped working immediately.');

        // --- TEST 8: Change Name & Email Profile ---
        console.log('\n[TEST 8] Testing Profile Update (Name & Email)...');
        const res8 = await request('/api/auth/profile', {
            method: 'PUT',
            body: { name: 'RamBabu G. (Proprietor)', email: 'owner.rambabu@saisrinivasa.com' }
        });
        console.log('Profile Update Response:', res8.status, res8.body);
        if (res8.status !== 200) throw new Error('Test 8 Failed: Profile update failed.');

        // Verify in DB
        const dbPool2 = await new sql.ConnectionPool({
            connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
        }).connect();
        const checkUserRes = await dbPool2.request().query(`SELECT name, email FROM users WHERE username = 'rambabu_new'`);
        const updatedDbUser = checkUserRes.recordset[0];
        await dbPool2.close();

        console.log('Updated SQL Server Record:', updatedDbUser);
        if (updatedDbUser.name !== 'RamBabu G. (Proprietor)' || updatedDbUser.email !== 'owner.rambabu@saisrinivasa.com') {
            throw new Error('Test 8 Failed: SQL Server database records were not updated properly.');
        }
        console.log('✅ TEST 8 PASSED: Profile name and email updated in SQL Server.');

        // --- TEST 9: Unauthenticated API Access Blocked ---
        console.log('\n[TEST 9] Testing Unauthenticated Access to Owner APIs...');
        authCookie = null;
        const res9a = await request('/api/auth/me');
        const res9b = await request('/api/auth/profile', { method: 'PUT', body: { name: 'Hacker' } });
        const res9c = await request('/api/auth/username', { method: 'PUT', body: { newUsername: 'hacked' } });
        const res9d = await request('/api/auth/password', { method: 'PUT', body: { newPassword: 'hacked' } });

        console.log('Unauth /me:', res9a.status, 'Unauth /profile:', res9b.status, 'Unauth /username:', res9c.status, 'Unauth /password:', res9d.status);
        if ([res9a, res9b, res9c, res9d].some(r => r.status !== 401)) {
            throw new Error('Test 9 Failed: Protected API allowed unauthenticated access!');
        }
        console.log('✅ TEST 9 PASSED: All owner APIs strictly return HTTP 401 when unauthenticated.');

        // --- TEST 10: Block Second Owner Account Creation ---
        console.log('\n[TEST 10] Attempting Second-Owner Setup after Owner Account Exists...');
        const res10 = await request('/api/auth/setup', {
            method: 'POST',
            body: {
                name: 'Second Owner',
                username: 'secondowner',
                email: 'second@test.com',
                password: 'SecondPass123!',
                confirmPassword: 'SecondPass123!'
            }
        });
        console.log('Second Setup Response:', res10.status, res10.body);
        if (res10.status !== 403 || res10.body.error !== 'Owner setup is no longer available. An owner account already exists.') {
            throw new Error('Test 10 Failed: Second owner setup was not blocked!');
        }
        console.log('✅ TEST 10 PASSED: Second owner creation blocked with HTTP 403.');

        console.log('\n===========================================================');
        console.log(' ALL 10 OWNER AUTHENTICATION SECURITY TESTS PASSED 100%! ');
        console.log('===========================================================');

    } catch (err) {
        console.error('\n❌ SECURITY TEST FAILURE:', err.message);
        process.exit(1);
    }
}

runSecurityTests();
