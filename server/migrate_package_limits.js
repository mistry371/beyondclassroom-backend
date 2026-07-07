const mongoose = require('mongoose');
const { models } = require('./database/db');
require('dotenv').config({ path: './.env' });

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const packageUpdates = {
      'beta': { customRequestLimit: -1, customRequestMaxMarks: -1 },
      'school': { customRequestLimit: -1, customRequestMaxMarks: -1 },
      'teachers': { customRequestLimit: 100, customRequestMaxMarks: -1 },
      'pro': { customRequestLimit: 50, customRequestMaxMarks: 80 },
      'basic': { customRequestLimit: 25, customRequestMaxMarks: 40 }
    };

    for (const [id, update] of Object.entries(packageUpdates)) {
      const result = await models.packages.updateOne(
        { _id: id },
        { $set: update }
      );
      console.log(`Updated package ${id}:`, result.modifiedCount > 0 ? 'Success' : 'Not found/No change');
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
