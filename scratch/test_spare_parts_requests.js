const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function runSparePartsRequestsTests() {
    console.log('===========================================================');
    console.log(' STARTING SPARE PARTS REQUEST SYSTEM END-TO-END TESTS');
    console.log('===========================================================');

    const BASE_URL = 'http://localhost:5000';
    let authCookie = null;

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
        // --- STEP 0: Create Owner Account if empty ---
        const statusRes = await request('/api/auth/setup-status');
        if (statusRes.body.setupRequired) {
            console.log('Setting up master owner account for test...');
            await request('/api/auth/setup', {
                method: 'POST',
                body: {
                    name: 'RamBabu Owner',
                    username: 'rambabu_test',
                    email: 'rambabu@saisrinivasa.com',
                    password: 'OwnerPassword123!',
                    confirmPassword: 'OwnerPassword123!'
                }
            });
        }

        // Login as Owner
        const loginRes = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'rambabu_test', password: 'OwnerPassword123!' }
        });
        if (loginRes.status !== 200) throw new Error('Owner login failed');
        console.log('✅ Owner logged in successfully. Cookie acquired.');

        // --- TEST 1: Submit Public Spare Part Request ---
        console.log('\n[TEST 1] Submitting Public Spare Part Request...');
        const reqPayload = {
            customerName: 'Rahul Sharma',
            mobileNumber: '9876543210',
            partName: 'Heavy Duty Disc Brake Pad Set',
            vehicleType: 'Two Wheeler',
            vehicleModel: 'Pulsar 150',
            quantity: 2,
            description: 'Require original OEM disc brake pads set'
        };

        const res1 = await request('/api/requests/spare-part', {
            method: 'POST',
            body: reqPayload
        });
        console.log('Submit Request Response:', res1.status, res1.body);
        if (res1.status !== 201 || !res1.body.success || !res1.body.requestId) {
            throw new Error('Test 1 Failed: Spare part request creation failed.');
        }

        const newId = res1.body.requestId;
        console.log(`Created Request ID: #${newId}`);

        // Verify direct SQL Server DB insertion
        const serverName = process.env.DB_SERVER || 'SAITEJA';
        const dbName = process.env.DB_NAME || 'sai_automobiles_db';
        const dbPool = await new sql.ConnectionPool({
            connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
        }).connect();

        const dbRes = await dbPool.request()
            .input('id', sql.Int, newId)
            .query(`SELECT * FROM dbo.spare_part_requests WHERE id = @id`);

        const dbRecord = dbRes.recordset[0];
        console.log('SQL Server Database Record:', dbRecord);
        await dbPool.close();

        if (!dbRecord || dbRecord.customer_name !== 'Rahul Sharma' || dbRecord.mobile_number !== '9876543210' || dbRecord.status !== 'Pending') {
            throw new Error('Test 1 Failed: Database record mismatch!');
        }
        console.log('✅ TEST 1 PASSED: Public request saved in SQL Server database as source of truth.');

        // --- TEST 2: Input Validation Tests ---
        console.log('\n[TEST 2] Testing Validation Errors...');
        const invalid1 = await request('/api/requests/spare-part', {
            method: 'POST',
            body: { ...reqPayload, mobileNumber: '123' } // Invalid mobile
        });
        if (invalid1.status !== 400 || invalid1.body.error !== 'Please enter a valid 10-digit mobile number.') {
            throw new Error('Test 2 Failed: Invalid mobile number was not rejected.');
        }

        const invalid2 = await request('/api/requests/spare-part', {
            method: 'POST',
            body: { ...reqPayload, partName: '' } // Missing part name
        });
        if (invalid2.status !== 400) {
            throw new Error('Test 2 Failed: Missing part name was not rejected.');
        }
        console.log('✅ TEST 2 PASSED: Server-side validation rejected invalid inputs.');

        // --- TEST 3: Unauthenticated Access Blocked ---
        console.log('\n[TEST 3] Testing Unauthenticated Access to Owner Requests API...');
        const savedCookie = authCookie;
        authCookie = null; // Strip cookie

        const unauthGet = await request('/api/requests/spare-parts');
        if (unauthGet.status !== 401) {
            throw new Error('Test 3 Failed: Unauthenticated access to /api/requests/spare-parts was not blocked.');
        }
        authCookie = savedCookie; // Restore cookie
        console.log('✅ TEST 3 PASSED: Unauthenticated access blocked with HTTP 401.');

        // --- TEST 4: Fetch Requests & Pending Badge Count ---
        console.log('\n[TEST 4] Fetching Requests List & Pending Count for Owner Console...');
        const listRes = await request('/api/requests/spare-parts');
        console.log('Requests Count:', listRes.body.count);
        if (listRes.status !== 200 || !listRes.body.data || listRes.body.data.length === 0) {
            throw new Error('Test 4 Failed: Owner could not list spare part requests.');
        }

        const countRes = await request('/api/requests/spare-parts/count');
        console.log('Counts API Response:', countRes.body);
        if (countRes.status !== 200 || countRes.body.pendingCount < 1) {
            throw new Error('Test 4 Failed: Pending count metric failed.');
        }
        console.log('✅ TEST 4 PASSED: Owner requests list and pending badge count retrieved.');

        // --- TEST 5: Update Request Status ---
        console.log('\n[TEST 5] Updating Request Status to Contacted...');
        const updateRes = await request(`/api/requests/spare-parts/${newId}/status`, {
            method: 'PATCH',
            body: { status: 'Contacted' }
        });
        console.log('Update Status Response:', updateRes.status, updateRes.body);
        if (updateRes.status !== 200 || !updateRes.body.success) {
            throw new Error('Test 5 Failed: Status update failed.');
        }

        // Verify in DB
        const dbPool2 = await new sql.ConnectionPool({
            connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${serverName};Database=${dbName};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
        }).connect();
        const checkStatus = await dbPool2.request()
            .input('id', sql.Int, newId)
            .query(`SELECT status FROM dbo.spare_part_requests WHERE id = @id`);
        const updatedStatus = checkStatus.recordset[0]?.status;
        await dbPool2.close();

        if (updatedStatus !== 'Contacted') {
            throw new Error('Test 5 Failed: SQL Server database status did not update!');
        }
        console.log('✅ TEST 5 PASSED: Request status updated to Contacted in SQL Server.');

        // --- TEST 6: Delete Request ---
        console.log('\n[TEST 6] Testing Delete Request...');
        const deleteRes = await request(`/api/requests/spare-parts/${newId}`, {
            method: 'DELETE'
        });
        console.log('Delete Response:', deleteRes.status, deleteRes.body);
        if (deleteRes.status !== 200 || !deleteRes.body.success) {
            throw new Error('Test 6 Failed: Delete request failed.');
        }
        console.log('✅ TEST 6 PASSED: Request deleted from SQL Server.');

        console.log('\n===========================================================');
        console.log(' ALL SPARE PARTS REQUEST SYSTEM TESTS PASSED 100%! ');
        console.log('===========================================================');

    } catch (err) {
        console.error('\n❌ TEST FAILURE:', err.message);
        process.exit(1);
    }
}

runSparePartsRequestsTests();
