const mongoose = require('mongoose');

async function checkLatest() {
    try {
        await mongoose.connect('mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0');
        const db = mongoose.connection.db;
        
        // Find latest 5 payments
        const payments = await db.collection('payments').find().sort({createdAt: -1}).limit(5).toArray();
        console.log("LATEST PAYMENTS:");
        payments.forEach(p => console.log(`Payment: ${p._id} | User: ${p.userId} | Pkg: ${p.packageId} | Course: ${p.courseId} | SelCourses: ${JSON.stringify(p.selectedCourseIds)}`));

        // Find the user for the latest payment
        if (payments.length > 0) {
            const userId = payments[0].userId;
            const user = await db.collection('users').findOne({_id: userId});
            console.log("\nLATEST USER:", userId);
            console.log("Purchased Courses:", user.purchasedCourses);
        }
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkLatest();
