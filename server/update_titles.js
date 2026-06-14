require('dotenv').config();
const mongoose = require('mongoose');
const { db, initDB, models } = require('./database/db.js');
async function run() {
  await initDB();
  const courses = await models.courses.find({});
  for (const c of courses) {
    if (c.title && c.title.includes('Mathematics Mastery')) {
      const newTitle = c.title.replace(' Mathematics Mastery', '');
      await models.courses.updateOne({ _id: c._id }, { $set: { title: newTitle } });
      console.log('Updated', c.title, 'to', newTitle);
    }
  }
  process.exit(0);
}
run();
