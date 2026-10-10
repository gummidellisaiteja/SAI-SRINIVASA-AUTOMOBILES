/**
 * Live test: requests a real password reset code and emails it to the registered Gmail.
 * Run: node scratch/test_live_email.js
 */
const BASE = 'http://localhost:5000';

async function main() {
    console.log('\n========================================');
    console.log(' LIVE FORGOT PASSWORD EMAIL TEST');
    console.log('========================================\n');

    // Step 1: Request reset code
    console.log('Requesting reset code for gummidellisaiteja@gmail.com...');
    const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'gummidellisaiteja@gmail.com' })
    });
    const data = await res.json();

    console.log('HTTP Status:', res.status);
    console.log('Response   :', data);

    if (res.status === 200 && data.success) {
        console.log('\n✅ SUCCESS!');
        console.log('   A 6-digit reset code has been emailed to gummidellisaiteja@gmail.com');
        console.log('   Check your Gmail inbox (and Spam folder if not visible).');
    } else {
        console.log('\n❌ FAILED:', data);
    }

    process.exit(0);
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
