const axios = require('axios');

async function triggerRecovery() {
  const url = 'https://beyondclassroom-backend.onrender.com/api/system/check-payments';
  
  console.log('Waiting for live server to deploy the check endpoint (this may take 1-2 minutes)...');
  
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
        console.log('   RECENT PAYMENTS   ');
        console.log('=============================================\n');
        
        console.log(JSON.stringify(response.data.payments, null, 2));
      }
    } catch (error) {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('\n\nTimed out waiting for deployment.');
      }
    }
  }, 5000);
}

triggerRecovery();
