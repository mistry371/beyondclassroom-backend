const mongoose = require('mongoose');

async function testAtlas() {
    try {
        await mongoose.connect('mongodb+srv://admin:BeyondC%401019@cluster0.p7oj1rs.mongodb.net/beyondclassroom?retryWrites=true&w=majority&appName=Cluster0');
        const db = mongoose.connection.db;
        const users = await db.collection('users').countDocuments();
        const payments = await db.collection('payments').countDocuments();
        const orders = await db.collection('orders').countDocuments();
        const packages = await db.collection('packages').countDocuments();
        const modules = await db.collection('modules').countDocuments();
        const lessons = await db.collection('lessons').countDocuments();
        const subtopics = await db.collection('subtopics').countDocuments();
        console.log("ATLAS COUNTS:", {users, payments, orders, packages, modules, lessons, subtopics});
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testAtlas();
