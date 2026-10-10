/**
 * AUTH DIAGNOSTIC SCRIPT
 * Reads the ACTUAL hash from DB and tests bcrypt.compare correctly.
 * DO NOT commit - scratch only.
 */
const { poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const CANDIDATES = [
    'OwnerPass123!',
    'NewOwnerPass456!',
    'rambabu',
    'admin',
    'Admin123!',
    'password',
    'Password@2026',
    'Owner@2026',
];

async function main() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT id, username, email, password_hash, role
            FROM users WHERE role = 'owner'
        `);

        if (result.recordset.length === 0) {
            console.log('❌ NO OWNER FOUND IN DATABASE');
            return;
        }

        for (const user of result.recordset) {
            console.log('='.repeat(60));
            console.log(`User ID    : ${user.id}`);
            console.log(`Username   : ${user.username}`);
            console.log(`Email      : ${user.email}`);
            console.log(`Role       : ${user.role}`);
            const h = user.password_hash;
            console.log(`Hash (first10): ${h ? h.slice(0, 10) : 'NULL'}`);
            console.log(`Hash length: ${h ? h.length : 0}`);
            console.log(`Hash valid bcrypt prefix: ${h ? h.startsWith('$2a$') || h.startsWith('$2b$') : false}`);
            console.log('');
            console.log('Testing candidate passwords against stored hash:');

            if (!h) {
                console.log('  ❌ password_hash is NULL or empty — this IS the login bug!');
                continue;
            }

            let matchFound = false;
            for (const pwd of CANDIDATES) {
                const match = await bcrypt.compare(pwd, h);
                const icon = match ? '✅ MATCH' : '   no match';
                console.log(`  ${icon} : "${pwd}"`);
                if (match) matchFound = true;
            }

            if (!matchFound) {
                console.log('');
                console.log('  ⚠️  None of the candidate passwords matched.');
                console.log('  The password used during setup is not in this list.');
                console.log('  The owner must supply the password they used during setup,');
                console.log('  OR the hash in the database has been corrupted/truncated.');
            }
        }

        console.log('='.repeat(60));
    } catch (err) {
        console.error('DIAGNOSTIC ERROR:', err);
    } finally {
        process.exit(0);
    }
}

main();
