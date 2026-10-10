/**
 * OWNER PASSWORD RESET UTILITY — LOCAL ONLY
 * Run this on the server machine ONLY (requires direct DB access).
 * This is the emergency recovery tool when the owner forgets their password.
 *
 * Usage:
 *   node scratch/reset_owner_password.js
 *
 * It will prompt for the new password securely and update the DB.
 * NEVER commit this with a hardcoded password.
 */
const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Validate password strength
function validatePassword(pwd) {
    const errors = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least one special character (!@#$%^&* etc.)');
    return errors;
}

async function promptHidden(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        process.stdout.write(prompt);

        // Try to hide input on TTY
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }

        let pwd = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const handler = (char) => {
            if (char === '\n' || char === '\r' || char === '\u0004') {
                if (process.stdin.isTTY) process.stdin.setRawMode(false);
                process.stdin.removeListener('data', handler);
                process.stdout.write('\n');
                rl.close();
                resolve(pwd);
            } else if (char === '\u0003') {
                process.stdout.write('\n');
                process.exit(0);
            } else if (char === '\u007F' || char === '\b') {
                if (pwd.length > 0) {
                    pwd = pwd.slice(0, -1);
                    process.stdout.write('\b \b');
                }
            } else {
                pwd += char;
                process.stdout.write('*');
            }
        };

        process.stdin.on('data', handler);
    });
}

async function resetOwnerPassword() {
    console.log('');
    console.log('='.repeat(60));
    console.log('  SAI SRINIVASA AUTOMOBILES — OWNER PASSWORD RESET UTILITY');
    console.log('='.repeat(60));
    console.log('  This tool updates the owner password directly in SQL Server.');
    console.log('  Run ONLY on the server machine. Do NOT share this tool.');
    console.log('='.repeat(60));
    console.log('');

    const pool = await poolPromise;

    // Verify owner exists
    const checkResult = await pool.request().query(`
        SELECT id, name, username, email FROM users WHERE role = 'owner'
    `);

    if (checkResult.recordset.length === 0) {
        console.error('❌ No owner account found in the database.');
        console.error('   Please run the first-time setup at /setup.html first.');
        process.exit(1);
    }

    const owner = checkResult.recordset[0];
    console.log(`  Owner Account Found:`);
    console.log(`  Name     : ${owner.name}`);
    console.log(`  Username : ${owner.username}`);
    console.log(`  Email    : ${owner.email}`);
    console.log('');

    let newPassword;
    let confirmPassword;

    // Prompt for new password
    while (true) {
        newPassword = await promptHidden('  Enter new password        : ');

        if (!newPassword || newPassword.trim() === '') {
            console.log('  ❌ Password cannot be empty. Try again.\n');
            continue;
        }

        const errors = validatePassword(newPassword);
        if (errors.length > 0) {
            console.log('  ❌ Password does not meet requirements:');
            errors.forEach(e => console.log('     - ' + e));
            console.log('');
            continue;
        }

        confirmPassword = await promptHidden('  Confirm new password      : ');

        if (newPassword !== confirmPassword) {
            console.log('  ❌ Passwords do not match. Try again.\n');
            continue;
        }

        break;
    }

    console.log('');
    console.log('  Hashing password with bcrypt (cost factor 12)...');
    const hash = await bcrypt.hash(newPassword, 12);

    // Clear the new password from memory immediately
    newPassword = null;
    confirmPassword = null;

    // Update hash in database
    await pool.request()
        .input('id', sql.Int, owner.id)
        .input('hash', sql.NVarChar(255), hash)
        .query(`
            UPDATE users
            SET password_hash = @hash,
                updated_at = SYSUTCDATETIME()
            WHERE id = @id AND role = 'owner'
        `);

    console.log('');
    console.log('  ✅ Password updated successfully in SQL Server.');
    console.log('  You can now log in at /login.html with your new password.');
    console.log('='.repeat(60));
    process.exit(0);
}

resetOwnerPassword().catch(err => {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
});
