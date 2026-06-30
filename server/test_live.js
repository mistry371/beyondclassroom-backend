const axios = require('axios');

async function testLiveAPI() {
  const API_URL = 'https://beyondclassroom-backend.onrender.com/api';
  
  try {
    console.log('Testing live API...');
    
    // 1. Create a test user
    const email = `test_${Date.now()}@example.com`;
    console.log('Registering user:', email);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email,
      password: 'password123',
      phone: `99${Date.now().toString().slice(-8)}`
    });
    
    const token = regRes.data.token;
    console.log('Registered successfully! Token received.');

    // 2. Fetch profile
    const profileRes = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Profile purchasedCourses:', profileRes.data.user.purchasedCourses);

    // 3. Get all courses to pick one
    const coursesRes = await axios.get(`${API_URL}/courses`);
    if (coursesRes.data.courses && coursesRes.data.courses.length > 0) {
      const courseId = coursesRes.data.courses[0]._id;
      console.log('Will try to buy course:', courseId);

      // 4. Create mock order
      const orderRes = await axios.post(`${API_URL}/payment/create-order`, {
        courseId,
        amount: 2
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      console.log('Order created:', orderRes.data.order.id);

      // 5. Verify payment (mock)
      const verifyRes = await axios.post(`${API_URL}/payment/verify`, {
        courseId,
        razorpay_order_id: orderRes.data.order.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature'
      }, { headers: { Authorization: `Bearer ${token}` } });

      console.log('Verify response:', verifyRes.data.success);

      // 6. Fetch profile again
      const profileRes2 = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile purchasedCourses AFTER purchase:', profileRes2.data.user.purchasedCourses);
    } else {
      console.log('No courses found on live API');
    }
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
}

testLiveAPI();
