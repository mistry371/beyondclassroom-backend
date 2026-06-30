require('dotenv').config();
const mongoose = require('mongoose');

// Define minimal schemas required for recovery
const paymentSchema = new mongoose.Schema({
  _id: { type: String },
  userId: String,
  packageId: String,
  courseId: String,
  selectedCourseIds: [String],
  status: String,
  amount: Number,
}, { strict: false });

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed },
  name: String,
  email: String,
  purchasedCourses: [String],
}, { strict: false });

const Payment = mongoose.model('Payment', paymentSchema, 'payments');
const User = mongoose.model('User', userSchema, 'users');

async function runRecovery() {
  console.log('\n=============================================');
  console.log('   BEYOND CLASSROOM - PURCHASE RECOVERY SCRIPT   ');
  console.log('=============================================\n');

  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log('*** RUNNING IN DRY-RUN MODE (No database writes will occur) ***\n');
  }

  // Check if URI is provided either from .env or hardcoded
  // By default, we use the one found in .env (if uncommented)
  const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0';
  
  if (!uri) {
    console.error('ERROR: MONGODB_URI not found.');
    process.exit(1);
  }

  try {
    console.log('Connecting to Live Database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.\n');

    console.log('--- AUDITING HISTORICAL PAYMENTS ---');
    // 1. Find all successful payments
    const successfulPayments = await Payment.find({ status: 'success' }).lean();
    console.log(`Total successful payments found: ${successfulPayments.length}`);

    let affectedPurchasesCount = 0;
    const recoveryActions = [];

    // 2. Audit each payment
    for (const payment of successfulPayments) {
      let coursesToRestore = [];
      if (payment.packageId && payment.selectedCourseIds && payment.selectedCourseIds.length > 0) {
        coursesToRestore = payment.selectedCourseIds;
      } else if (payment.courseId) {
        coursesToRestore = [payment.courseId];
      }

      if (coursesToRestore.length === 0) {
        continue;
      }

      // 3. Find the user associated with the payment
      const user = await User.findById(payment.userId).lean();
      if (!user) {
        console.log(`[WARNING] Payment ${payment._id} belongs to user ${payment.userId} who no longer exists. Skipping.`);
        continue;
      }

      // 4. Determine if there are missing courses
      const userCourses = user.purchasedCourses || [];
      const missingCourses = coursesToRestore.filter(courseId => !userCourses.includes(courseId));

      if (missingCourses.length > 0) {
        affectedPurchasesCount++;
        recoveryActions.push({
          paymentId: payment._id,
          userId: user._id,
          userName: user.name || user.email,
          missingCourses: missingCourses
        });
      }
    }

    console.log(`\n--- AUDIT RESULTS ---`);
    console.log(`Total historical purchases affected by the bug: ${affectedPurchasesCount}`);
    
    if (affectedPurchasesCount === 0) {
      console.log('No missing courses detected. All successful payments have correctly granted access.');
      process.exit(0);
    }

    console.log('\nThe following users are missing courses that they paid for:');
    recoveryActions.forEach(action => {
      console.log(`- User: ${action.userName} (ID: ${action.userId}) | Payment ID: ${action.paymentId}`);
      console.log(`  Missing Courses to restore: ${action.missingCourses.join(', ')}`);
    });

    console.log('\n--- EXECUTING RECOVERY ---');
    // 5. Execute safe idempotent recovery
    let restoredCount = 0;
    for (const action of recoveryActions) {
      if (isDryRun) {
        console.log(`[DRY RUN] Would restore courses for user: ${action.userName} (${action.missingCourses.join(', ')})`);
        restoredCount++;
      } else {
        const result = await User.updateOne(
          { _id: action.userId },
          { $addToSet: { purchasedCourses: { $each: action.missingCourses } } }
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
          console.log(`[SUCCESS] Restored courses for user: ${action.userName}`);
          restoredCount++;
        }
      }
    }

    console.log('\n=============================================');
    console.log(`RECOVERY COMPLETE: Successfully restored courses for ${restoredCount} affected purchases.`);
    console.log(`Your recent successful purchases have been completely restored!`);
    console.log('=============================================\n');

  } catch (error) {
    console.error('\n[FATAL ERROR] Script execution failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runRecovery();
