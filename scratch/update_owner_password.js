/**
 * EMERGENCY OWNER PASSWORD UPDATE
 * -------------------------------------------------------
 * USAGE (from command prompt, NOT powershell for safety):
 *   node scratch/update_owner_password.js "YourNewPassword@2026"
 *
 * POWERSHELL users — wrap in single quotes to prevent $ expansion:
 *   node scratch/update_owner_password.js 'YourNewPassword@2026'
 *
 * This script updates the owner's password_hash in SQL Server.
 * It requires the new password to meet strength requirements.
 *
 * DO NOT: run this without removing it afterwards.
 * DO NOT: commit this file with a real password in the argument.
 * -------------------------------------------------------
 */
const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

function validatePassword(pwd) {
    const errors = [];
    if (!pwd || pwd.length < 8)      errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd))          errors.push('Uppercase letter required');
    if (!/[a-z]/.test(pwd))          errors.push('Lowercase letter required');
    if (!/[0-9]/.test(pwd))          errors.push('Number required');
    if (!/[^A-Za-z0-9]/.test(pwd))  errors.push('Special character required');
    return errors;
}

async function main() {
    const newPassword = process.argv[2];

    if (!newPassword) {
        console.error('Usage: node scratch/update_owner_password.js "YourNewPassword@2026"');
        process.exit(1);
    }

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
        console.error('❌ Password does not meet requirements:');
        errors.forEach(e => console.error('   -', e));
        process.exit(1);
    }

    try {
        const pool = await poolPromise;

        const checkResult = await pool.request().query(`
            SELECT id, name, username, email FROM users WHERE role = 'owner'
        `);

        if (checkResult.recordset.length === 0) {
            console.error('❌ No owner account found.');
            process.exit(1);
        }

        const owner = checkResult.recordset[0];
        console.log(`Updating password for: ${owner.name} (${owner.username})`);
        console.log('Hashing with bcrypt (cost 12)...');

        const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        await pool.request()
            .input('id',   sql.Int,           owner.id)
            .input('hash', sql.NVarChar(255), hash)
            .query(`
                UPDATE users
                SET password_hash = @hash,
                    updated_at = SYSUTCDATETIME()
                WHERE id = @id AND role = 'owner'
            `);

        // Verify the new hash works
        const testMatch = await bcrypt.compare(newPassword, hash);
        if (!testMatch) {
            console.error('❌ CRITICAL: bcrypt.compare verification failed immediately after hashing!');
            process.exit(1);
        }

        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Password updated successfully in SQL Server.');
        console.log('✅ bcrypt.compare verification passed.');
        console.log(`   Username: ${owner.username}`);
        console.log(`   Hash length: ${hash.length} chars (should be 60)`);
        console.log('   You can now log in at /login.html with your new password.');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('FATAL ERROR:', err.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
