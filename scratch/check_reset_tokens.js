const { poolPromise } = require('../config/db');

async function main() {
    const pool = await poolPromise;

    // Check all reset tokens
    const tokens = await pool.request().query(`
        SELECT 
            t.id,
            u.email,
            t.token_hash,
            t.expires_at,
            t.attempts,
            t.used_at,
            t.created_at,
            CASE 
                WHEN t.used_at IS NOT NULL THEN 'USED/INVALIDATED'
                WHEN t.expires_at < SYSUTCDATETIME() THEN 'EXPIRED'
                WHEN t.attempts >= 5 THEN 'MAX ATTEMPTS'
                ELSE 'VALID'
            END AS status
        FROM password_reset_tokens t
        JOIN users u ON u.id = t.user_id
        ORDER BY t.created_at DESC
    `);

    console.log('\n=== PASSWORD RESET TOKENS IN DB ===');
    if (tokens.recordset.length === 0) {
        console.log('No tokens found in DB.');
    } else {
        tokens.recordset.forEach((t, i) => {
            console.log(`\n[Token ${i+1}]`);
            console.log('  Email     :', t.email);
            console.log('  Status    :', t.status);
            console.log('  Created   :', t.created_at);
            console.log('  Expires   :', t.expires_at);
            console.log('  Attempts  :', t.attempts, '/ 5');
            console.log('  Used at   :', t.used_at || 'NOT USED');
            console.log('  Hash(10)  :', t.token_hash?.slice(0,10) + '...');
        });
    }

    // Check current server time vs expiry
    const now = await pool.request().query('SELECT SYSUTCDATETIME() AS now');
    console.log('\nServer UTC time now:', now.recordset[0].now);

    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
