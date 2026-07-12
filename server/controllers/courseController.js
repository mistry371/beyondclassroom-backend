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
    const rawId = req.params.id;
    const isCompound = rawId.includes('_');
    const baseId = isCompound ? rawId.split('_')[0] : rawId;
    const pkgId = isCompound ? rawId.split('_')[1] : null;

    const course = await models.courses.findOne({ _id: baseId }).lean();
    if (course) course._id = rawId;

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.query.populate === 'true') {
      const { isAdmin, ownsCourse, previewableSubtopicIds, stripDoc } = require('../utils/contentAccess');
      const authorized = isAdmin(req.user) || ownsCourse(req.user, baseId);

      // Modules are stored under the BASE course id (e.g. "course-class-1"),
      // never the composite "course-class-1_package" id. Always query with baseId.
      const modules = await models.modules.find({ courseId: baseId }).lean();
      const moduleIds = modules.map(m => m._id);

      const lessons = moduleIds.length > 0
        ? await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
        : [];
      const lessonIds = lessons.map(l => l._id);

      let subtopics = (moduleIds.length > 0 || lessonIds.length > 0)
        ? await models.subtopics.find({
            $or: [
              { moduleId: { $in: moduleIds } },
              { lessonId: { $in: lessonIds } }
            ]
          }).select({ 'documents.data': 0, 'document.data': 0 }).lean()
        : [];

      if (pkgId) {
        subtopics = subtopics.filter(st => {
          if (!st.packageIds || st.packageIds.length === 0) return true;
          return st.packageIds.includes(pkgId);
        });
      }

      // Preview set: first subtopic of each module is a free preview (or any
      // subtopic explicitly flagged isPreview). Consistent across ALL courses (#1).
      const previewIds = new Set();
      for (const m of modules) {
        const mSubs = subtopics.filter(s => s.moduleId === m._id);
        previewableSubtopicIds(mSubs).forEach(id => previewIds.add(id));
      }

      // For an unauthorized viewer, strip premium payloads. Preview subtopics
      // keep their viewable content (base64 already removed above → not
      // downloadable); everything else is locked.
      const gateSubtopic = (s) => {
        const preview = previewIds.has(s._id);
        s.isPreview = preview;
        if (s.documents) s.documents = s.documents.map(d => stripDoc(d, { keepUrl: authorized || preview }));
        if (s.document) s.document = stripDoc(s.document, { keepUrl: authorized || preview });
        if (!authorized && !preview) { s.content = ''; s.locked = true; }
        return s;
      };
      const gateLesson = (lesson) => {
        if (authorized) return lesson;
        return { ...lesson, videoUrl: '', content: '', locked: true };
      };

      // Construct nested structure
      const populatedModules = modules.map(moduleItem => {
        const moduleLessons = lessons
          .filter(l => l.moduleId === moduleItem._id)
          .map(lesson => {
            const lessonSubtopics = subtopics.filter(s => s.lessonId === lesson._id).map(gateSubtopic);
            return { ...gateLesson(lesson), subtopics: lessonSubtopics };
          });

        const directSubtopics = subtopics.filter(s => s.moduleId === moduleItem._id && !s.lessonId).map(gateSubtopic);

        return {
          ...moduleItem,
          title: moduleItem.title,
          lessons: moduleLessons,
          directSubtopics
        };
      });

      course.modules = populatedModules;
      course.viewerAuthorized = authorized;
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
