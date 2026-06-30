require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jenish2:jenish%401003@jenish2.zmy5q.mongodb.net/beyondclassroom_new?retryWrites=true&w=majority&appName=jenish2');
  console.log('Connected');
  
  const subtopics = mongoose.model('subtopics', new mongoose.Schema({
    documents: [mongoose.Schema.Types.Mixed],
    document: mongoose.Schema.Types.Mixed
  }, { strict: false }));
  
  const subs = await subtopics.find();
  let count = 0;
  for (let s of subs) {
    let changed = false;
    if (s.documents && Array.isArray(s.documents)) {
      s.documents.forEach(d => {
        if (d && d.type === 'application/pdf' && !d.url) {
          d.url = '/dummy-pdf.pdf';
          changed = true;
        }
      });
    }
    if (s.document && s.document.type === 'application/pdf' && !s.document.url) {
      s.document.url = '/dummy-pdf.pdf';
      changed = true;
    }
    if (changed) {
      await subtopics.updateOne({_id: s._id}, { $set: { documents: s.documents, document: s.document } });
      count++;
    }
  }
  
  console.log('Updated ' + count + ' subtopics');
  process.exit(0);
}

fix();
