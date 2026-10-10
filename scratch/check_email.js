const { poolPromise } = require('../config/db');
async function main() {
    const pool = await poolPromise;
    const r = await pool.request().query(`SELECT id, name, username, email, role FROM users WHERE role = 'owner'`);
    console.log('Owner record in DB:', r.recordset[0]);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
