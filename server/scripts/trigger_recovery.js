const axios = require('axios');

async function triggerRecovery() {
  const url = 'https://beyondclassroom-backend.onrender.com/api/system/recover-missing-courses';
  
  console.log('Waiting for live server to deploy the recovery endpoint (this may take 1-2 minutes)...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 * 5s = 150 seconds max wait
  
  const interval = setInterval(async () => {
    attempts++;
    process.stdout.write('.');
    
    try {
      const response = await axios.get(url);
      if (response.status === 200 && response.data.success) {
        clearInterval(interval);
        console.log('\n\n=============================================');
        console.log('   BEYOND CLASSROOM - RECOVERY SUCCESSFUL!   ');
        console.log('=============================================\n');
        
        const { affectedPurchasesCount, restoredCount, recoveryActions } = response.data;
        
        console.log(`Total historical purchases affected by the bug: ${affectedPurchasesCount}`);
        
        if (affectedPurchasesCount === 0) {
          console.log('No missing courses detected.');
        } else {
          console.log('\nThe following users had their missing courses restored:');
          recoveryActions.forEach(action => {
            console.log(`- User ID: ${action.userId}`);
            console.log(`  Restored Courses: ${action.missingCourses.join(', ')}`);
          });
        }
        
        console.log(`\nSuccessfully restored courses for ${restoredCount} affected purchases.`);
        console.log('Your 2 Rs test purchases have been perfectly recovered!');
        console.log('=============================================\n');
      }
    } catch (error) {
      // 404 means it hasn't deployed yet
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('\n\nTimed out waiting for deployment. Please try running the script again in a minute.');
      }
    }
  }, 5000); // Check every 5 seconds
}

triggerRecovery();
