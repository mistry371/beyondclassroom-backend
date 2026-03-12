const { db, initDB } = require('./database/db');
const bcrypt = require('bcryptjs');

async function seedInvestorDemo() {
  try {
    console.log('🚀 Starting Investor Demo Data Seeding...\n');

    await initDB();
    await db.read();

    // Clear existing data
    db.data.users = [];
    db.data.courses = [];
    db.data.orders = [];
    db.data.notifications = [];
    db.data.modules = [];
    db.data.lessons = [];
    db.data.progress = [];
    db.data.subscriptions = [];
    db.data.cart = [];
    db.data.otps = [];

    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminPassword = await bcrypt.hash('jenish@1019', 12);

    // ==================== USERS ====================
    console.log('👥 Creating users...');
    
    // Admin
    db.data.users.push({
      _id: 'admin-1',
      name: 'Jenish Mistry',
      email: 'mistryjenish1003@gmail.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: [],
      favorites: [],
      emailVerified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date()
    });

    // 20 Students with varying purchase patterns
    const studentNames = [
      'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Singh', 'Vikram Reddy',
      'Anjali Gupta', 'Rohan Mehta', 'Pooja Desai', 'Arjun Nair', 'Kavya Iyer',
      'Siddharth Joshi', 'Neha Kapoor', 'Karan Malhotra', 'Riya Agarwal', 'Aditya Verma',
      'Ishita Bansal', 'Varun Saxena', 'Tanvi Shah', 'Harsh Pandey', 'Diya Khanna'
    ];

    for (let i = 0; i < 20; i++) {
      const purchasedCount = Math.floor(Math.random() * 8) + 1; // 1-8 courses
      const purchasedCourses = [];
      for (let j = 0; j < purchasedCount; j++) {
        purchasedCourses.push(`course-${j + 1}`);
      }

      db.data.users.push({
        _id: `user-${i + 1}`,
        name: studentNames[i],
        email: `student${i + 1}@example.com`,
        password: hashedPassword,
        role: 'user',
        status: i >= 18 ? 'suspended' : 'active', // Last 2 suspended
        profilePhoto: '',
        isGuest: false,
        purchasedCourses,
        favorites: [`course-${(i % 25) + 1}`, `course-${((i + 5) % 25) + 1}`],
        emailVerified: true,
        createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }

    console.log(`✅ Created ${db.data.users.length} users (1 admin + 20 students)\n`);

    // ==================== 25 COURSES ====================
    console.log('📚 Creating 25 comprehensive courses...');

    const courses = [
      {
        title: 'Complete Algebra Mastery - Class 5-8',
        description: 'Master fundamental algebra concepts including variables, expressions, equations, and word problems. Perfect for students in grades 5-8 with interactive lessons and practice exercises.',
        category: 'Algebra',
        difficulty: 'Beginner',
        price: 999,
        instructor: 'Prof. Rajesh Kumar, IIT Delhi',
        duration: '8 weeks',
        topics: ['Variables & Expressions', 'Linear Equations', 'Word Problems', 'Inequalities', 'Graphing', 'Polynomials'],
        enrolledCount: 450,
        rating: 4.8,
        isFeatured: true
      },
      {
        title: 'Advanced Algebra - Class 9-10',
        description: 'Deep dive into quadratic equations, polynomials, factorization, and algebraic identities. Comprehensive course for high school students preparing for board exams.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        price: 1499,
        instructor: 'Dr. Priya Sharma, PhD Mathematics',
        duration: '10 weeks',
        topics: ['Quadratic Equations', 'Polynomials', 'Factorization', 'Algebraic Identities', 'Rational Expressions', 'Systems of Equations'],
        enrolledCount: 380,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Calculus Fundamentals - Class 11-12',
        description: 'Complete calculus course covering limits, derivatives, integrals, and applications. Essential for JEE, NEET, and board exam preparation.',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 1999,
        instructor: 'Prof. Amit Verma, IIT Bombay',
        duration: '12 weeks',
        topics: ['Limits & Continuity', 'Derivatives', 'Applications of Derivatives', 'Integrals', 'Definite Integrals', 'Differential Equations'],
        enrolledCount: 520,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Geometry Basics - Class 6-8',
        description: 'Learn fundamental geometry concepts including shapes, angles, triangles, circles, and area calculations with visual demonstrations.',
        category: 'Geometry',
        difficulty: 'Beginner',
        price: 899,
        instructor: 'Mrs. Anjali Gupta, M.Sc Mathematics',
        duration: '6 weeks',
        topics: ['Lines & Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Area & Perimeter', 'Volume'],
        enrolledCount: 340,
        rating: 4.7,
        isFeatured: false
      },
      {
        title: 'Advanced Geometry - Class 9-10',
        description: 'Master coordinate geometry, constructions, theorems, and proofs. Perfect for students preparing for competitive exams.',
        category: 'Geometry',
        difficulty: 'Intermediate',
        price: 1299,
        instructor: 'Prof. Vikram Singh, NIT Trichy',
        duration: '8 weeks',
        topics: ['Coordinate Geometry', 'Constructions', 'Theorems & Proofs', 'Similarity', 'Pythagoras Theorem', 'Trigonometry Basics'],
        enrolledCount: 290,
        rating: 4.8,
        isFeatured: false
      },
      {
        title: 'Trigonometry Complete Course',
        description: 'Comprehensive trigonometry covering ratios, identities, equations, and applications. Essential for Class 10-12 students.',
        category: 'Trigonometry',
        difficulty: 'Intermediate',
        price: 1399,
        instructor: 'Dr. Rohan Mehta, PhD IIT Madras',
        duration: '10 weeks',
        topics: ['Trigonometric Ratios', 'Identities', 'Equations', 'Inverse Functions', 'Heights & Distances', 'Complex Numbers'],
        enrolledCount: 410,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Statistics & Probability - Class 9-12',
        description: 'Master data analysis, probability theory, distributions, and statistical inference with real-world applications.',
        category: 'Statistics',
        difficulty: 'Intermediate',
        price: 1599,
        instructor: 'Prof. Neha Kapoor, ISI Kolkata',
        duration: '10 weeks',
        topics: ['Data Analysis', 'Probability', 'Distributions', 'Hypothesis Testing', 'Regression', 'Correlation'],
        enrolledCount: 360,
        rating: 4.8,
        isFeatured: true
      },
      {
        title: 'Number Theory & Cryptography',
        description: 'Explore prime numbers, modular arithmetic, and cryptographic applications. Perfect for olympiad preparation.',
        category: 'Number Theory',
        difficulty: 'Advanced',
        price: 1799,
        instructor: 'Dr. Siddharth Joshi, CMI Chennai',
        duration: '12 weeks',
        topics: ['Prime Numbers', 'Modular Arithmetic', 'Diophantine Equations', 'RSA Cryptography', 'Fermat\'s Theorem', 'Euler\'s Function'],
        enrolledCount: 180,
        rating: 4.9,
        isFeatured: false
      },
      {
        title: 'Linear Algebra & Matrices',
        description: 'Complete course on vectors, matrices, determinants, and linear transformations for Class 12 and engineering students.',
        category: 'Linear Algebra',
        difficulty: 'Advanced',
        price: 1699,
        instructor: 'Prof. Karan Malhotra, IIT Kanpur',
        duration: '10 weeks',
        topics: ['Vectors', 'Matrices', 'Determinants', 'Linear Transformations', 'Eigenvalues', 'Vector Spaces'],
        enrolledCount: 310,
        rating: 4.8,
        isFeatured: true
      },
      {
        title: 'Differential Equations Mastery',
        description: 'Learn to solve ordinary and partial differential equations with applications in physics and engineering.',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 1899,
        instructor: 'Dr. Riya Agarwal, IISc Bangalore',
        duration: '12 weeks',
        topics: ['First Order ODEs', 'Second Order ODEs', 'Laplace Transforms', 'Series Solutions', 'PDEs', 'Applications'],
        enrolledCount: 240,
        rating: 4.9,
        isFeatured: false
      },
      {
        title: 'Complex Numbers & Functions',
        description: 'Master complex numbers, functions, and their applications in advanced mathematics and engineering.',
        category: 'Advanced Math',
        difficulty: 'Advanced',
        price: 1599,
        instructor: 'Prof. Aditya Verma, TIFR Mumbai',
        duration: '8 weeks',
        topics: ['Complex Numbers', 'Argand Plane', 'De Moivre\'s Theorem', 'Complex Functions', 'Contour Integration', 'Residue Theorem'],
        enrolledCount: 200,
        rating: 4.8,
        isFeatured: false
      },
      {
        title: 'Vectors & 3D Geometry',
        description: 'Complete course on vector algebra and three-dimensional geometry for Class 12 and JEE preparation.',
        category: 'Geometry',
        difficulty: 'Advanced',
        price: 1499,
        instructor: 'Prof. Ishita Bansal, IIT Roorkee',
        duration: '10 weeks',
        topics: ['Vector Algebra', 'Dot & Cross Product', '3D Lines', '3D Planes', 'Spheres', 'Vector Applications'],
        enrolledCount: 330,
        rating: 4.8,
        isFeatured: true
      },
      {
        title: 'Mathematical Reasoning & Logic',
        description: 'Develop logical thinking and mathematical reasoning skills essential for problem-solving and proofs.',
        category: 'Logic',
        difficulty: 'Intermediate',
        price: 1199,
        instructor: 'Dr. Varun Saxena, JNU Delhi',
        duration: '6 weeks',
        topics: ['Statements', 'Logical Connectives', 'Quantifiers', 'Proof Techniques', 'Mathematical Induction', 'Contradiction'],
        enrolledCount: 270,
        rating: 4.7,
        isFeatured: false
      },
      {
        title: 'Sequences & Series Complete',
        description: 'Master arithmetic, geometric, and special sequences with convergence tests and applications.',
        category: 'Algebra',
        difficulty: 'Intermediate',
        price: 1299,
        instructor: 'Prof. Tanvi Shah, BHU Varanasi',
        duration: '8 weeks',
        topics: ['Arithmetic Progression', 'Geometric Progression', 'Harmonic Progression', 'Special Series', 'Convergence Tests', 'Applications'],
        enrolledCount: 320,
        rating: 4.8,
        isFeatured: false
      },
      {
        title: 'Permutations & Combinations',
        description: 'Complete course on counting principles, permutations, combinations, and probability applications.',
        category: 'Combinatorics',
        difficulty: 'Intermediate',
        price: 1199,
        instructor: 'Dr. Harsh Pandey, IIT Guwahati',
        duration: '6 weeks',
        topics: ['Fundamental Principle', 'Permutations', 'Combinations', 'Binomial Theorem', 'Probability', 'Applications'],
        enrolledCount: 390,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Sets, Relations & Functions',
        description: 'Foundation course on set theory, relations, and functions essential for higher mathematics.',
        category: 'Set Theory',
        difficulty: 'Beginner',
        price: 999,
        instructor: 'Mrs. Diya Khanna, DU Delhi',
        duration: '6 weeks',
        topics: ['Sets', 'Operations on Sets', 'Relations', 'Types of Relations', 'Functions', 'Types of Functions'],
        enrolledCount: 420,
        rating: 4.7,
        isFeatured: false
      },
      {
        title: 'Limits & Continuity Mastery',
        description: 'Deep understanding of limits, continuity, and their applications in calculus.',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 1399,
        instructor: 'Prof. Rahul Sharma, IIT Delhi',
        duration: '8 weeks',
        topics: ['Limits', 'Continuity', 'Differentiability', 'L\'Hospital\'s Rule', 'Intermediate Value Theorem', 'Applications'],
        enrolledCount: 350,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Integration Techniques & Applications',
        description: 'Master various integration techniques and their applications in area, volume, and physics.',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 1699,
        instructor: 'Dr. Priya Patel, IIT Kharagpur',
        duration: '10 weeks',
        topics: ['Integration Methods', 'Definite Integrals', 'Area Under Curves', 'Volume of Solids', 'Applications in Physics', 'Numerical Integration'],
        enrolledCount: 380,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Coordinate Geometry Complete',
        description: 'Comprehensive course on straight lines, circles, parabolas, ellipses, and hyperbolas.',
        category: 'Geometry',
        difficulty: 'Intermediate',
        price: 1499,
        instructor: 'Prof. Amit Kumar, NIT Surathkal',
        duration: '12 weeks',
        topics: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola', 'Conic Sections'],
        enrolledCount: 400,
        rating: 4.8,
        isFeatured: true
      },
      {
        title: 'Mathematical Olympiad Preparation',
        description: 'Advanced problem-solving techniques for RMO, INMO, and international olympiads.',
        category: 'Olympiad',
        difficulty: 'Advanced',
        price: 2499,
        instructor: 'Dr. Vikram Reddy, IMO Gold Medalist',
        duration: '16 weeks',
        topics: ['Number Theory', 'Algebra', 'Geometry', 'Combinatorics', 'Problem Solving', 'Contest Strategies'],
        enrolledCount: 150,
        rating: 5.0,
        isFeatured: true
      },
      {
        title: 'JEE Advanced Mathematics',
        description: 'Complete JEE Advanced preparation with previous year questions and mock tests.',
        category: 'JEE Preparation',
        difficulty: 'Advanced',
        price: 2999,
        instructor: 'Prof. Sneha Singh, IIT Bombay (AIR 12)',
        duration: '20 weeks',
        topics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry', 'Vectors', 'Mock Tests'],
        enrolledCount: 680,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'CBSE Board Class 10 Mathematics',
        description: 'Complete CBSE Class 10 syllabus coverage with board exam preparation and sample papers.',
        category: 'Board Exam',
        difficulty: 'Intermediate',
        price: 1999,
        instructor: 'Mrs. Anjali Gupta, 15+ years experience',
        duration: '12 weeks',
        topics: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Trigonometry', 'Statistics'],
        enrolledCount: 890,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'CBSE Board Class 12 Mathematics',
        description: 'Complete CBSE Class 12 syllabus with board exam strategies and previous year solutions.',
        category: 'Board Exam',
        difficulty: 'Advanced',
        price: 2499,
        instructor: 'Prof. Rohan Mehta, 20+ years experience',
        duration: '16 weeks',
        topics: ['Relations & Functions', 'Calculus', 'Vectors', '3D Geometry', 'Linear Programming', 'Probability'],
        enrolledCount: 950,
        rating: 4.9,
        isFeatured: true
      },
      {
        title: 'Vedic Mathematics Techniques',
        description: 'Learn ancient Vedic mathematics techniques for fast calculations and mental math.',
        category: 'Vedic Math',
        difficulty: 'Beginner',
        price: 799,
        instructor: 'Guru Siddharth Joshi',
        duration: '4 weeks',
        topics: ['Multiplication Tricks', 'Division Shortcuts', 'Squaring Methods', 'Cube Roots', 'Algebraic Formulas', 'Speed Math'],
        enrolledCount: 560,
        rating: 4.8,
        isFeatured: false
      },
      {
        title: 'Applied Mathematics for Engineers',
        description: 'Practical mathematics for engineering students covering Fourier series, transforms, and numerical methods.',
        category: 'Engineering Math',
        difficulty: 'Advanced',
        price: 1999,
        instructor: 'Dr. Karan Malhotra, IIT Madras',
        duration: '14 weeks',
        topics: ['Fourier Series', 'Laplace Transforms', 'Numerical Methods', 'Vector Calculus', 'Complex Analysis', 'PDEs'],
        enrolledCount: 420,
        rating: 4.8,
        isFeatured: true
      }
    ];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      db.data.courses.push({
        _id: `course-${i + 1}`,
        ...course,
        thumbnail: '',
        status: i < 23 ? 'published' : 'draft', // Last 2 are draft
        createdAt: new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }

    console.log(`✅ Created ${db.data.courses.length} courses\n`);

    // ==================== MODULES & LESSONS ====================
    console.log('📖 Creating modules and lessons for first 5 courses...');

    for (let courseIdx = 0; courseIdx < 5; courseIdx++) {
      const courseId = `course-${courseIdx + 1}`;
      
      // Create 4 modules per course
      for (let modIdx = 0; modIdx < 4; modIdx++) {
        const moduleId = `module-${courseIdx + 1}-${modIdx + 1}`;
        
        db.data.modules.push({
          _id: moduleId,
          courseId,
          title: `Module ${modIdx + 1}: ${['Introduction', 'Core Concepts', 'Advanced Topics', 'Practice & Assessment'][modIdx]}`,
          description: `Comprehensive coverage of ${['fundamental concepts', 'core principles', 'advanced techniques', 'practice problems'][modIdx]}`,
          order: modIdx + 1,
          duration: `${2 + modIdx} weeks`,
          isLocked: false,
          createdAt: new Date()
        });

        // Create 3 lessons per module
        for (let lessonIdx = 0; lessonIdx < 3; lessonIdx++) {
          db.data.lessons.push({
            _id: `lesson-${courseIdx + 1}-${modIdx + 1}-${lessonIdx + 1}`,
            moduleId,
            title: `Lesson ${lessonIdx + 1}: ${['Theory & Concepts', 'Examples & Solutions', 'Practice Problems'][lessonIdx]}`,
            description: `Detailed explanation with ${['theoretical foundation', 'worked examples', 'practice exercises'][lessonIdx]}`,
            order: lessonIdx + 1,
            duration: `${30 + lessonIdx * 15} minutes`,
            type: 'lesson',
            content: {
              concept: `<h2>Comprehensive Content</h2><p>This lesson covers important concepts with detailed explanations, examples, and practice problems.</p><h3>Key Points:</h3><ul><li>Fundamental understanding</li><li>Step-by-step solutions</li><li>Real-world applications</li></ul>`,
              summary: 'Complete understanding of the topic with practical applications'
            },
            videoUrl: null,
            isLocked: false,
            createdAt: new Date()
          });
        }
      }
    }

    console.log(`✅ Created ${db.data.modules.length} modules and ${db.data.lessons.length} lessons\n`);

    // ==================== ORDERS ====================
    console.log('🛒 Creating orders...');

    for (let i = 0; i < 15; i++) {
      const userId = `user-${i + 1}`;
      const user = db.data.users.find(u => u._id === userId);
      const coursesCount = user.purchasedCourses.length;
      
      const orderCourses = user.purchasedCourses.slice(0, Math.min(coursesCount, 3));
      const totalAmount = orderCourses.reduce((sum, courseId) => {
        const course = db.data.courses.find(c => c._id === courseId);
        return sum + (course?.price || 0);
      }, 0);

      db.data.orders.push({
        _id: `order-${i + 1}`,
        user: userId,
        courses: orderCourses,
        totalAmount,
        status: 'completed',
        createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000)
      });
    }

    console.log(`✅ Created ${db.data.orders.length} orders\n`);

    // ==================== PROGRESS ====================
    console.log('📊 Creating progress records...');

    for (let i = 0; i < 15; i++) {
      const userId = `user-${i + 1}`;
      const user = db.data.users.find(u => u._id === userId);
      
      user.purchasedCourses.forEach((courseId, idx) => {
        const completion = Math.floor(Math.random() * 100);
        const lessonsCompleted = [];
        
        // Add some completed lessons
        if (completion > 20) {
          lessonsCompleted.push(`lesson-1-1-1`, `lesson-1-1-2`);
        }

        db.data.progress.push({
          _id: `progress-${userId}-${courseId}`,
          userId,
          courseId,
          completionPercentage: completion,
          lessonsCompleted,
          quizzesCompleted: [],
          lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000)
        });
      });
    }

    console.log(`✅ Created ${db.data.progress.length} progress records\n`);

    // ==================== NOTIFICATIONS ====================
    console.log('🔔 Creating notifications...');

    for (let i = 0; i < 20; i++) {
      const userId = `user-${i + 1}`;
      
      // Welcome notification
      db.data.notifications.push({
        _id: `notif-welcome-${i + 1}`,
        user: userId,
        title: 'Welcome to Elite Math Platform! 🎉',
        message: 'Start your learning journey with 25+ comprehensive courses',
        type: 'info',
        isRead: i < 10,
        createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000)
      });

      // Course enrollment notification
      if (i < 15) {
        db.data.notifications.push({
          _id: `notif-enroll-${i + 1}`,
          user: userId,
          title: 'Course Enrollment Successful! 📚',
          message: 'You have successfully enrolled in your courses. Start learning now!',
          type: 'success',
          isRead: i < 8,
          createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000)
        });
      }
    }

    console.log(`✅ Created ${db.data.notifications.length} notifications\n`);

    // ==================== SUBSCRIPTIONS ====================
    console.log('💳 Creating subscriptions...');

    for (let i = 0; i < 15; i++) {
      const userId = `user-${i + 1}`;
      const user = db.data.users.find(u => u._id === userId);
      
      user.purchasedCourses.slice(0, 2).forEach((courseId, idx) => {
        const course = db.data.courses.find(c => c._id === courseId);
        const startDate = new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        
        db.data.subscriptions.push({
          _id: `sub-${userId}-${courseId}`,
          userId,
          courseId,
          planName: 'Standard Access',
          startDate,
          endDate,
          durationDays: 90,
          status: i < 12 ? 'active' : 'expired',
          autoRenew: i % 2 === 0,
          price: course?.price || 999,
          createdAt: startDate
        });
      });
    }

    console.log(`✅ Created ${db.data.subscriptions.length} subscriptions\n`);

    await db.write();

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 INVESTOR DEMO DATA SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   👥 Users: ${db.data.users.length} (1 admin + 20 students)`);
    console.log(`   📚 Courses: ${db.data.courses.length} (23 published + 2 draft)`);
    console.log(`   📖 Modules: ${db.data.modules.length}`);
    console.log(`   📝 Lessons: ${db.data.lessons.length}`);
    console.log(`   🛒 Orders: ${db.data.orders.length}`);
    console.log(`   📊 Progress: ${db.data.progress.length}`);
    console.log(`   🔔 Notifications: ${db.data.notifications.length}`);
    console.log(`   💳 Subscriptions: ${db.data.subscriptions.length}`);
    
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   Admin: mistryjenish1003@gmail.com / jenish@1019`);
    console.log(`   Students: student1@example.com to student20@example.com / password123`);
    
    console.log(`\n🚀 Ready for investor demo!`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedInvestorDemo();
