const http = require('http');

const PORT = 5000;
const API_BASE = `http://localhost:${PORT}/api`;
const MOCK_USER_EMAIL = 'uat_student_' + Date.now() + '@example.com';
const MOCK_PASSWORD = 'Password123!';

// Simple fetch wrapper to ensure backend is ready
async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${data?.message || response.statusText}`);
  }
  return data;
}

async function runUAT() {
  console.log('--- STARTING COMPREHENSIVE UAT ---');

  try {
    // 1. Check if backend is alive
    console.log('\n[1] Checking Server Status...');
    const healthRes = await fetchAPI('/courses').catch(() => null);
    if (!healthRes) {
      console.log('❌ Backend is not reachable. Ensure the server is running on port 5000.');
      return;
    }
    console.log('✅ Server is alive and returning courses.');

    // 2. Student Registration & Auth Flow
    console.log('\n[2] Testing Student Auth Flow...');
    const regRes = await fetchAPI('/auth/register', 'POST', {
      name: 'UAT Student',
      email: MOCK_USER_EMAIL,
      password: MOCK_PASSWORD,
      phone: Math.floor(Math.random() * 10000000000).toString()
    });
    console.log('✅ Student Registered');
    
    const loginRes = await fetchAPI('/auth/login', 'POST', {
      email: MOCK_USER_EMAIL,
      password: MOCK_PASSWORD
    });
    const userToken = loginRes.token;
    console.log('✅ Student Logged In. Token received.');

    // 3. Admin Auth Flow
    console.log('\n[3] Testing Admin Auth Flow...');
    const adminLoginRes = await fetchAPI('/auth/login', 'POST', {
      email: 'mistryjenish1003@gmail.com',
      password: 'Jenish@1019'
    });
    const adminToken = adminLoginRes.token;
    console.log('✅ Admin Logged In. Token received.');

    // 4. Packages Data Flow
    console.log('\n[4] Testing Packages API Flow...');
    const publicPackages = await fetchAPI('/packages', 'GET');
    console.log(`✅ Public API returned ${publicPackages.packages?.length} active packages.`);
    
    const adminPackages = await fetchAPI('/packages/admin', 'GET', null, adminToken);
    console.log(`✅ Admin API returned ${adminPackages.packages?.length} total packages.`);
    
    if (adminPackages.packages?.length > 0) {
      const p = adminPackages.packages[0];
      console.log(`   - Test Package: ${p.name} (Active: ${p.active})`);
    } else {
      console.log('⚠️ No packages found. UAT will create a test package.');
      const newPkg = await fetchAPI('/packages/admin', 'POST', {
        name: 'UAT Test Package',
        priceINR: 199,
        active: true
      }, adminToken);
      console.log(`✅ Created Test Package: ${newPkg.package.name}`);
    }

    // 5. Custom Requests Flow
    console.log('\n[5] Testing Custom Requests Flow...');
    const customReq = await fetchAPI('/custom-requests', 'POST', {
      title: 'UAT Custom Request',
      description: 'I need a custom math package for class 6',
      deliverable: 'custom_course_package',
      budget: 1500,
      difficulty: 'standard'
    }, userToken);
    console.log('✅ Student successfully submitted Custom Request.');
    
    const adminReqs = await fetchAPI('/custom-requests/admin', 'GET', null, adminToken);
    console.log(`✅ Admin retrieved ${adminReqs.requests?.length} custom requests.`);
    
    const updateReq = await fetchAPI(`/custom-requests/admin/${customReq.request._id}`, 'PUT', {
      status: 'approved',
      quotedPrice: 1200,
      adminNote: 'Approved for UAT'
    }, adminToken);
    console.log('✅ Admin successfully updated Custom Request status to Approved.');

    console.log('\n🎉 ALL CORE API FLOWS TESTED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ UAT FAILED:', error.message);
  }
}

runUAT();
