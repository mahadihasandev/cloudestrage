const db = require('../db');

async function testUpgrade() {
    try {
        console.log("Checking for users in the database...");
        const users = await db('users').select('*').limit(2);
        
        if (users.length === 0) {
            console.log("No users found to test storage increment. This test is skipped.");
            process.exit(0);
        }

        const user = users[0];
        console.log(`Testing storage upgrade for user ID ${user.id} (${user.username})...`);
        const initialStorage = user.storage_limit_bytes;
        console.log(`Initial Storage Limit: ${initialStorage} bytes`);

        const additionalBytes = 1000;
        console.log(`Adding ${additionalBytes} bytes...`);

        const updatedUser = await db('users')
            .where({ id: user.id })
            .increment('storage_limit_bytes', additionalBytes)
            .returning(['id', 'storage_limit_bytes'])
            .then(rows => rows[0]);

        console.log(`Updated Storage Limit: ${updatedUser.storage_limit_bytes} bytes`);
        
        if (Number(updatedUser.storage_limit_bytes) === Number(initialStorage) + additionalBytes) {
            console.log('SUCCESS: Increment works perfectly on Neon database!');
            // Revert the changes
            await db('users')
                .where({ id: user.id })
                .decrement('storage_limit_bytes', additionalBytes);
            console.log("Cleanup: Reverted storage limit back to original.");
        } else {
            console.error('ERROR: Storage limit did not increment as expected.');
        }

    } catch (err) {
        console.error("Error during test:", err);
    } finally {
        await db.destroy();
    }
}

testUpgrade();
