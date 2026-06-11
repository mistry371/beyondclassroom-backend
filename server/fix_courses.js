require('dotenv').config();
const { initDB, models } = require('./database/db');

async function run() {
  await initDB();
  const courses = await models.courses.find().lean();
  console.log(JSON.stringify(courses, null, 2));
  process.exit(0);
}

run();
