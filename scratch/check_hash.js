const { poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

async function main() {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT password_hash FROM users WHERE role = 'owner'`);
    const hash = result.recordset[0]?.password_hash;
    console.log('Hash prefix:', hash?.slice(0, 10), '| length:', hash?.length);

    const candidates = [
        'Owner@123456',
        'OwnerPass123!',
        'NewOwnerPass456!',
        'Owner@2026',
        'rambabu',
        'Admin@123',
        'Rambabu@123',
    ];
    for (const c of candidates) {
        const ok = await bcrypt.compare(c, hash);
        if (ok) console.log('✅ MATCH:', c);
        else    console.log('   no match:', c);
    }
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
