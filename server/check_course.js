const mongoose = require('mongoose');

async function checkCourse() {
    try {
        await mongoose.connect('mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0');
        const db = mongoose.connection.db;
        
        const course = await db.collection('courses').findOne({ _id: 'course-class-1' });
        console.log("Course 1:", course ? `Found: ${course.title} (Published: ${course.isPublished})` : "NOT FOUND");

        const payments = await db.collection('payments').find().sort({createdAt: -1}).limit(2).toArray();
        console.log("LATEST PAYMENTS:");
        payments.forEach(p => console.log(`Payment: ${p._id} | User: ${p.userId} | Pkg: ${p.packageId} | Course: ${p.courseId} | SelCourses: ${JSON.stringify(p.selectedCourseIds)}`));

        if (payments.length > 0) {
            const user = await db.collection('users').findOne({ _id: payments[0].userId });
            if (user) {
                console.log("\nUser purchasedCourses:", user.purchasedCourses);
            }
        }
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkCourse();
