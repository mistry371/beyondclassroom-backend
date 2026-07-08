const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/beyondclassroom').then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('Jenish@1019', 12);
  await db.collection('promoters').updateOne(
    { email: 'mistryjenish1234@gmail.com' },
    { $set: { password: hash } }
  );
  console.log("Promoter password reset to Jenish@1019");
  process.exit(0);
});
