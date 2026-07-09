const { models } = require('../database/db');
const { normalizeCourseCategory } = require('../constants/categories');

exports.getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = { status: 'published' };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: 'i' };

    let courses = await models.courses.find(query).lean();
    courses = courses.map(c => ({ ...c, category: normalizeCourseCategory(c.category) }));

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedCourses = async (req, res) => {
  try {
    const courses = await models.courses.find({ isFeatured: true, status: 'published' }).limit(6).lean();
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await models.courses.findOne({ _id: req.params.id }).lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.query.populate === 'true') {
      const modules = await models.modules.find({ courseId: course._id }).lean();
      const moduleIds = modules.map(m => m._id);

      const lessons = moduleIds.length > 0
        ? await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
        : [];
      const lessonIds = lessons.map(l => l._id);

      const subtopics = (moduleIds.length > 0 || lessonIds.length > 0)
        ? await models.subtopics.find({
            $or: [
              { moduleId: { $in: moduleIds } },
              { lessonId: { $in: lessonIds } }
            ]
          }).select({ 'documents.data': 0, 'document.data': 0 }).lean()
        : [];

      // Construct nested structure
      const populatedModules = modules.map(moduleItem => {
        const moduleLessons = lessons
          .filter(l => l.moduleId === moduleItem._id)
          .map(lesson => {
            const lessonSubtopics = subtopics.filter(s => s.lessonId === lesson._id).map(s => {
              if (s.documents) s.documents = s.documents.map(({ data, ...doc }) => doc);
              if (s.document) {
                const { data, ...doc } = s.document;
                s.document = doc;
              }
              return s;
            });
            return { ...lesson, subtopics: lessonSubtopics };
          });

        const directSubtopics = subtopics.filter(s => s.moduleId === moduleItem._id && !s.lessonId).map(s => {
          if (s.documents) s.documents = s.documents.map(({ data, ...doc }) => doc);
          if (s.document) {
            const { data, ...doc } = s.document;
            s.document = doc;
          }
          return s;
        });

        return {
          ...moduleItem,
          title: moduleItem.title,
          lessons: moduleLessons,
          directSubtopics
        };
      });

      course.modules = populatedModules;
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await models.courses.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await models.courses.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await models.courses.findOneAndDelete({ _id: req.params.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
