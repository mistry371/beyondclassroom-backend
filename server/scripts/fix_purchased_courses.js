const mongoose = require('mongoose');
const { initDB, models } = require('../database/db');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fixPurchasedCourses() {
  try {
    await initDB();
    console.log('--- Starting Database Cleanup for Purchased Courses ---');

    const users = await models.users.find({ purchasedCourses: { $exists: true, $not: { $size: 0 } } });
    console.log(`Found ${users.length} users with purchased courses.`);

    let fixedCount = 0;

    for (const user of users) {
      if (user.role === 'admin' || user.email === 'mistryjenish1003@gmail.com') {
        continue; // Skip admin accounts
      }

      // Find all successful payments/orders for this user
      const payments = await models.payments.find({ userId: user._id, status: { $ne: 'failed' } }).lean();
      const orders = await models.orders.find({ userId: user._id, status: { $ne: 'failed' } }).lean();

      // Collect all legitimately purchased courses
      const legitimateCourseIds = new Set();
      
      // Add from payments (e.g. razorpay)
      for (const payment of payments) {
        if (payment.selectedCourseIds && payment.selectedCourseIds.length > 0) {
          payment.selectedCourseIds.forEach(id => legitimateCourseIds.add(id));
        } else if (payment.courseId) {
          legitimateCourseIds.add(payment.courseId);
        }
      }

      // Add from orders (e.g. cart checkout)
      for (const order of orders) {
        if (order.courses && order.courses.length > 0) {
          order.courses.forEach(id => legitimateCourseIds.add(id));
        }
      }

      // Compare with the user's current purchasedCourses
      const currentPurchased = user.purchasedCourses || [];
      
      // Filter out package IDs since they might have been added to purchasedCourses
      const packages = await models.packages.find().lean();
      const packageIds = new Set(packages.map(p => p._id));
      
      const filteredCurrent = currentPurchased.filter(id => !packageIds.has(id)); // Don't strip package IDs if we don't want to, actually wait.
      // We should keep the package IDs if they bought them, but let's just make sure they only have courses they paid for.
      
      const newPurchasedCourses = currentPurchased.filter(id => {
        // Keep it if it's a package ID
        if (packageIds.has(id)) return true;
        
        // Keep it if it's in the legitimate set
        if (legitimateCourseIds.has(id)) return true;
        
        // If it's the demo course, keep it
        if (id === 'course-class-6-demo') return true;

        // Otherwise, it's an unpurchased course! Remove it.
        return false;
      });

      if (newPurchasedCourses.length !== currentPurchased.length) {
        const removed = currentPurchased.filter(id => !newPurchasedCourses.includes(id));
        console.log(`User ${user.email} (${user._id}): Removed ${removed.length} unpurchased courses.`, removed);
        
        // Update user
        await models.users.updateOne(
          { _id: user._id },
          { $set: { purchasedCourses: newPurchasedCourses } }
        );
        fixedCount++;
      }
    }

    console.log(`--- Cleanup Complete. Fixed ${fixedCount} user accounts. ---`);
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

fixPurchasedCourses();
