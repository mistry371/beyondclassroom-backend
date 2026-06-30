const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'mistryjenish1003@gmail.com' });
  console.log('USER ID TYPE:', typeof user._id, user._id);
  const payments = await db.collection('payments').find({}).toArray();
  console.log('PAYMENTS:', payments);
  process.exit(0);
});
