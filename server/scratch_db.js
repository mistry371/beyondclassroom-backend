const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0';

async function checkLiveDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Check user 'Mistry Jenish'
  const users = await mongoose.connection.collection('users').find({ name: /Jenish/i }).toArray();
  console.log('User purchased courses:', users.map(u => ({ email: u.email, courses: u.purchasedCourses })));

  // Check packages
  const packages = await mongoose.connection.collection('packages').find().toArray();
  console.log('Packages:');
  packages.forEach(p => console.log(`- ${p._id}: courseIds = ${JSON.stringify(p.courseIds)}`));

  process.exit(0);
}

checkLiveDB().catch(console.error);
