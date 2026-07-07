const mongoose = require('mongoose');
const { models } = require('./database/db');
require('dotenv').config({ path: './.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find user
  const user = await models.users.findOne({ email: 'mistryjenish1003@gmail.com' });

  // Call the actual controller function
  const customRequestController = require('./controllers/customRequestController');
  
  // Helper to extract the function since it's not exported
  const getLimits = async (usr) => {
    // We mock req and res to call getMyLimits
    const req = { user: usr };
    let jsonRes = null;
    const res = {
      json: (data) => { jsonRes = data; },
      status: (code) => res
    };
    await customRequestController.getMyLimits(req, res);
    return jsonRes;
  };

  const limit1 = await getLimits(user);
  console.log('Initial limit:', limit1);

  // Add package basic and a course
  const packageId = 'basic';
  const courseId = 'course-class-5';
  
  await models.users.updateOne(
    { _id: user._id },
    { $addToSet: { purchasedCourses: { $each: [courseId, packageId] } } }
  );

  const updatedUser = await models.users.findOne({ email: 'mistryjenish1003@gmail.com' });

  const limit2 = await getLimits(updatedUser);
  console.log('Updated limit:', limit2);

  // Add beta package (unlimited)
  await models.users.updateOne(
    { _id: user._id },
    { $addToSet: { purchasedCourses: 'beta' } }
  );

  const betaUser = await models.users.findOne({ email: 'mistryjenish1003@gmail.com' });
  const limit3 = await getLimits(betaUser);
  console.log('Beta limit:', limit3);

  // Revert
  await models.users.updateOne(
    { _id: user._id },
    { $pullAll: { purchasedCourses: [courseId, packageId, 'beta'] } }
  );
  
  process.exit(0);
}

test().catch(console.error);
