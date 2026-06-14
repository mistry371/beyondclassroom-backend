const { models, db } = require('../database/db');
const generateId = () => 'testi-' + Date.now().toString() + Math.random().toString(36).slice(2, 6);

exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await models.testimonials.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, grade, image, content, rating, active } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }

    const newTestimonial = {
      _id: generateId(),
      name,
      grade: grade || '',
      image: image || '',
      content,
      rating: rating || 5,
      active: active !== undefined ? active : true,
      createdAt: new Date(),
    };

    await models.testimonials.create(newTestimonial);
    db.data.testimonials.push(newTestimonial);

    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const testimonial = await models.testimonials.findById(id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const updated = await models.testimonials.findOneAndUpdate(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    ).lean();

    const idx = db.data.testimonials.findIndex(t => t._id === id);
    if (idx !== -1) {
      db.data.testimonials[idx] = updated;
    }

    res.json({ success: true, testimonial: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = await models.testimonials.findById(id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    await models.testimonials.deleteOne({ _id: id });
    db.data.testimonials = db.data.testimonials.filter(t => t._id !== id);

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
