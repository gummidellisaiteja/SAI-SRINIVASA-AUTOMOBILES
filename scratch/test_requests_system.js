const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

async function runTests() {
    console.log('===========================================================');
    console.log(' RUNNING COMPREHENSIVE SPARE PARTS REQUEST SYSTEM TESTS');
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
        // --- STEP 1: Ensure Owner Exists & Login ---
        const statusRes = await request('/api/auth/setup-status');
        if (statusRes.body.setupRequired) {
            console.log('Creating owner account for test...');
            await request('/api/auth/setup', {
                method: 'POST',
                body: {
                    name: 'RamBabu Owner',
                    username: 'rambabu',
                    email: 'rambabu@saisrinivasa.com',
                    password: 'OwnerPassword123!',
                    confirmPassword: 'OwnerPassword123!'
                }
            });
        }

        const loginRes = await request('/api/auth/login', {
            method: 'POST',
            body: { username: 'rambabu', password: 'OwnerPassword123!' }
        });
        if (loginRes.status !== 200) throw new Error('Owner login failed: ' + JSON.stringify(loginRes.body));
        console.log('✅ Owner logged in successfully.');

        // --- STEP 2: Public Request Submission ---
        console.log('\n[TEST 1] Submitting Public Spare Part Request...');
        const reqPayload = {
            customerName: 'Suresh Kumar',
            mobileNumber: '9876543210',
            partName: 'Engine Oil Filter & Gasket',
            vehicleType: 'Tractor',
            vehicleModel: 'Mahindra 575 DI',
            quantity: 3,
            description: 'Require genuine heavy duty tractor engine oil filter'
        };

        const res1 = await request('/api/requests/spare-part', {
            method: 'POST',
            body: reqPayload
        });

        console.log('Submit Request Response:', res1.status, res1.body);
        if (res1.status !== 201 || !res1.body.success || !res1.body.requestId) {
            throw new Error('Test 1 Failed: Spare part request creation failed.');
        }

        const reqId = res1.body.requestId;
        console.log(`Created Request ID: #${reqId}`);

        // --- STEP 3: Server-side validation ---
        console.log('\n[TEST 2] Testing Validation Errors...');
        const invalid1 = await request('/api/requests/spare-part', {
            method: 'POST',
            body: { ...reqPayload, mobileNumber: '123' }
        });
        if (invalid1.status !== 400 || invalid1.body.error !== 'Please enter a valid 10-digit mobile number.') {
            throw new Error('Test 2 Failed: Invalid mobile number was not rejected.');
        }
        console.log('✅ TEST 2 PASSED: 10-digit mobile validation passed.');

        // --- STEP 4: Owner Requests API & Counts ---
        console.log('\n[TEST 3] Testing Owner Requests Listing & Badge Counts...');
        const listRes = await request('/api/requests/spare-parts');
        console.log('Requests Count in List:', listRes.body.count);
        if (listRes.status !== 200 || !listRes.body.data) {
            throw new Error('Test 3 Failed: Listing requests failed.');
        }

        const countRes = await request('/api/requests/spare-parts/count');
        console.log('Counts API Response:', countRes.body);
        if (countRes.status !== 200 || countRes.body.pendingCount < 1) {
            throw new Error('Test 3 Failed: Badge pending count failed.');
        }
        console.log('✅ TEST 3 PASSED: Owner requests list and sidebar badge pending count retrieved.');

        // --- STEP 5: Get Details by ID & Update Status ---
        console.log('\n[TEST 4] Fetching Details & Updating Status to Contacted...');
        const detailRes = await request(`/api/requests/spare-parts/${reqId}`);
        console.log('Request Details:', detailRes.body.data);

        const updateRes = await request(`/api/requests/spare-parts/${reqId}/status`, {
            method: 'PATCH',
            body: { status: 'Contacted' }
        });
        console.log('Status Update Response:', updateRes.status, updateRes.body);
        if (updateRes.status !== 200 || !updateRes.body.success) {
            throw new Error('Test 4 Failed: Status update failed.');
        }
        console.log('✅ TEST 4 PASSED: Status updated to Contacted.');

        // --- STEP 6: Delete Request ---
        console.log('\n[TEST 5] Deleting Request...');
        const deleteRes = await request(`/api/requests/spare-parts/${reqId}`, {
            method: 'DELETE'
        });
        console.log('Delete Response:', deleteRes.status, deleteRes.body);
        if (deleteRes.status !== 200 || !deleteRes.body.success) {
            throw new Error('Test 5 Failed: Request deletion failed.');
        }
        console.log('✅ TEST 5 PASSED: Request deleted.');

        console.log('\n===========================================================');
        console.log(' ALL SPARE PARTS REQUEST SYSTEM TESTS PASSED 100%! ');
        console.log('===========================================================');

    } catch (err) {
        console.error('\n❌ TEST FAILURE:', err.message);
        process.exit(1);
    }
}

runTests();
