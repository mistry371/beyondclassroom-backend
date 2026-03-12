const { db, initDB } = require('./database/db');

async function seedAdvancedCourse() {
  await initDB();
  await db.read();

  // Create a test course with advanced module system
  const testCourse = {
    _id: 'test-course-1',
    title: 'Complete Algebra Mastery',
    description: 'A comprehensive course covering algebra from fundamentals to advanced topics with interactive lessons, practice problems, and quizzes',
    category: 'Algebra',
    difficulty: 'Intermediate',
    price: 49.99,
    instructor: 'Prof. John Smith',
    duration: '8 weeks',
    topics: ['Linear Equations', 'Quadratic Equations', 'Functions', 'Polynomials'],
    thumbnail: '',
    isFeatured: true,
    enrolledCount: 0,
    rating: 5.0,
    createdAt: new Date()
  };

  // Add course if it doesn't exist
  if (!db.data.courses.find(c => c._id === testCourse._id)) {
    db.data.courses.push(testCourse);
  }

  // Create Modules
  const modules = [
    {
      _id: 'module-1',
      courseId: 'test-course-1',
      title: 'Algebra Fundamentals',
      description: 'Master the basic concepts of algebra',
      order: 1,
      duration: '2 weeks',
      lessons: [],
      quiz: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'module-2',
      courseId: 'test-course-1',
      title: 'Linear Equations',
      description: 'Learn to solve linear equations and systems',
      order: 2,
      duration: '2 weeks',
      lessons: [],
      quiz: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'module-3',
      courseId: 'test-course-1',
      title: 'Quadratic Equations',
      description: 'Master quadratic equations and their applications',
      order: 3,
      duration: '2 weeks',
      lessons: [],
      quiz: null,
      isLocked: false,
      createdAt: new Date()
    }
  ];

  db.data.modules = db.data.modules || [];
  modules.forEach(module => {
    if (!db.data.modules.find(m => m._id === module._id)) {
      db.data.modules.push(module);
    }
  });

  // Create Lessons for Module 1
  const lessons = [
    {
      _id: 'lesson-1-1',
      moduleId: 'module-1',
      title: 'Introduction to Variables',
      description: 'Understanding variables and algebraic expressions',
      order: 1,
      duration: '30 minutes',
      type: 'lesson',
      content: {
        concept: `
          <h2>What are Variables?</h2>
          <p>A variable is a symbol (usually a letter) that represents a number we don't know yet.</p>
          
          <h3>Key Points:</h3>
          <ul>
            <li>Variables can represent any number</li>
            <li>We use letters like x, y, z to represent variables</li>
            <li>Variables help us write general rules and formulas</li>
          </ul>

          <h3>Examples:</h3>
          <p><strong>Example 1:</strong> If x = 5, then 2x = 2 × 5 = 10</p>
          <p><strong>Example 2:</strong> If y = 3, then y + 7 = 3 + 7 = 10</p>
          <p><strong>Example 3:</strong> If z = 4, then 3z - 2 = 3 × 4 - 2 = 12 - 2 = 10</p>

          <h3>Algebraic Expressions:</h3>
          <p>An algebraic expression is a combination of variables, numbers, and operations.</p>
          <ul>
            <li>2x + 3 (linear expression)</li>
            <li>x² - 5x + 6 (quadratic expression)</li>
            <li>3a + 2b - c (expression with multiple variables)</li>
          </ul>
        `,
        examples: [],
        practice: [],
        summary: 'Variables are symbols that represent unknown numbers. Algebraic expressions combine variables with numbers and operations.'
      },
      videoUrl: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'lesson-1-2',
      moduleId: 'module-1',
      title: 'Simplifying Expressions',
      description: 'Learn to combine like terms and simplify expressions',
      order: 2,
      duration: '45 minutes',
      type: 'lesson',
      content: {
        concept: `
          <h2>Simplifying Algebraic Expressions</h2>
          <p>Simplifying means combining like terms to make an expression shorter and easier to work with.</p>
          
          <h3>Like Terms:</h3>
          <p>Like terms have the same variable raised to the same power.</p>
          <ul>
            <li>3x and 5x are like terms (both have x)</li>
            <li>2x² and 7x² are like terms (both have x²)</li>
            <li>3x and 5y are NOT like terms (different variables)</li>
          </ul>

          <h3>Steps to Simplify:</h3>
          <ol>
            <li>Identify like terms</li>
            <li>Combine coefficients of like terms</li>
            <li>Write the simplified expression</li>
          </ol>

          <h3>Examples:</h3>
          <p><strong>Example 1:</strong> 3x + 5x = 8x</p>
          <p><strong>Example 2:</strong> 7y - 2y + 4y = 9y</p>
          <p><strong>Example 3:</strong> 2x + 3y + 5x - y = 7x + 2y</p>
          <p><strong>Example 4:</strong> 4a² + 3a + 2a² - a = 6a² + 2a</p>

          <h3>Distributive Property:</h3>
          <p>a(b + c) = ab + ac</p>
          <p><strong>Example:</strong> 3(x + 4) = 3x + 12</p>
          <p><strong>Example:</strong> 2(3y - 5) = 6y - 10</p>
        `,
        examples: [],
        practice: [],
        summary: 'Simplify expressions by combining like terms. Use the distributive property to expand expressions.'
      },
      videoUrl: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'lesson-2-1',
      moduleId: 'module-2',
      title: 'Solving One-Step Equations',
      description: 'Master the basics of solving simple equations',
      order: 1,
      duration: '40 minutes',
      type: 'lesson',
      content: {
        concept: `
          <h2>Solving One-Step Equations</h2>
          <p>An equation is a mathematical statement that two expressions are equal.</p>
          
          <h3>Goal:</h3>
          <p>Isolate the variable on one side of the equation.</p>

          <h3>Addition/Subtraction Equations:</h3>
          <p><strong>Example 1:</strong> x + 5 = 12</p>
          <p>Subtract 5 from both sides: x = 12 - 5 = 7</p>
          
          <p><strong>Example 2:</strong> y - 3 = 10</p>
          <p>Add 3 to both sides: y = 10 + 3 = 13</p>

          <h3>Multiplication/Division Equations:</h3>
          <p><strong>Example 3:</strong> 3x = 15</p>
          <p>Divide both sides by 3: x = 15 ÷ 3 = 5</p>
          
          <p><strong>Example 4:</strong> y/4 = 6</p>
          <p>Multiply both sides by 4: y = 6 × 4 = 24</p>

          <h3>Key Rule:</h3>
          <p>Whatever you do to one side, you must do to the other side!</p>
        `,
        examples: [],
        practice: [],
        summary: 'Solve one-step equations by performing the inverse operation on both sides.'
      },
      videoUrl: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'lesson-2-2',
      moduleId: 'module-2',
      title: 'Solving Two-Step Equations',
      description: 'Learn to solve equations requiring multiple steps',
      order: 2,
      duration: '50 minutes',
      type: 'lesson',
      content: {
        concept: `
          <h2>Solving Two-Step Equations</h2>
          <p>Two-step equations require two operations to solve.</p>
          
          <h3>Strategy:</h3>
          <ol>
            <li>Undo addition or subtraction first</li>
            <li>Then undo multiplication or division</li>
          </ol>

          <h3>Examples:</h3>
          <p><strong>Example 1:</strong> 2x + 3 = 11</p>
          <p>Step 1: Subtract 3 from both sides: 2x = 8</p>
          <p>Step 2: Divide both sides by 2: x = 4</p>
          
          <p><strong>Example 2:</strong> 5y - 7 = 18</p>
          <p>Step 1: Add 7 to both sides: 5y = 25</p>
          <p>Step 2: Divide both sides by 5: y = 5</p>

          <p><strong>Example 3:</strong> x/3 + 4 = 10</p>
          <p>Step 1: Subtract 4 from both sides: x/3 = 6</p>
          <p>Step 2: Multiply both sides by 3: x = 18</p>

          <h3>Check Your Answer:</h3>
          <p>Always substitute your answer back into the original equation!</p>
          <p>For Example 1: 2(4) + 3 = 8 + 3 = 11 ✓</p>
        `,
        examples: [],
        practice: [],
        summary: 'Solve two-step equations by undoing operations in reverse order: addition/subtraction first, then multiplication/division.'
      },
      videoUrl: null,
      isLocked: false,
      createdAt: new Date()
    },
    {
      _id: 'lesson-3-1',
      moduleId: 'module-3',
      title: 'Introduction to Quadratic Equations',
      description: 'Understanding quadratic equations and their forms',
      order: 1,
      duration: '45 minutes',
      type: 'lesson',
      content: {
        concept: `
          <h2>Quadratic Equations</h2>
          <p>A quadratic equation is an equation of the form ax² + bx + c = 0</p>
          
          <h3>Standard Form:</h3>
          <p>ax² + bx + c = 0, where a ≠ 0</p>
          <ul>
            <li>a is the coefficient of x²</li>
            <li>b is the coefficient of x</li>
            <li>c is the constant term</li>
          </ul>

          <h3>Examples:</h3>
          <p><strong>Example 1:</strong> x² + 5x + 6 = 0 (a=1, b=5, c=6)</p>
          <p><strong>Example 2:</strong> 2x² - 3x - 5 = 0 (a=2, b=-3, c=-5)</p>
          <p><strong>Example 3:</strong> x² - 9 = 0 (a=1, b=0, c=-9)</p>

          <h3>Solutions:</h3>
          <p>Quadratic equations can have:</p>
          <ul>
            <li>Two real solutions</li>
            <li>One real solution (repeated root)</li>
            <li>No real solutions (complex solutions)</li>
          </ul>

          <h3>Methods to Solve:</h3>
          <ol>
            <li>Factoring</li>
            <li>Quadratic Formula</li>
            <li>Completing the Square</li>
            <li>Graphing</li>
          </ol>
        `,
        examples: [],
        practice: [],
        summary: 'Quadratic equations have the form ax² + bx + c = 0 and can be solved using various methods.'
      },
      videoUrl: null,
      isLocked: false,
      createdAt: new Date()
    }
  ];

  db.data.lessons = db.data.lessons || [];
  lessons.forEach(lesson => {
    if (!db.data.lessons.find(l => l._id === lesson._id)) {
      db.data.lessons.push(lesson);
    }
  });

  // Create Practice Problems
  const practices = [
    {
      _id: 'practice-1-1-1',
      lessonId: 'lesson-1-1',
      question: 'If x = 7, what is the value of 3x + 2?',
      type: 'solve',
      difficulty: 'easy',
      options: [],
      answer: '23',
      solution: 'Substitute x = 7 into the expression: 3(7) + 2 = 21 + 2 = 23',
      hints: ['First multiply 3 × 7', 'Then add 2 to the result'],
      points: 10,
      createdAt: new Date()
    },
    {
      _id: 'practice-1-1-2',
      lessonId: 'lesson-1-1',
      question: 'If y = 4, what is 2y - 5?',
      type: 'solve',
      difficulty: 'easy',
      options: [],
      answer: '3',
      solution: 'Substitute y = 4: 2(4) - 5 = 8 - 5 = 3',
      hints: ['Multiply 2 × 4 first', 'Then subtract 5'],
      points: 10,
      createdAt: new Date()
    },
    {
      _id: 'practice-1-2-1',
      lessonId: 'lesson-1-2',
      question: 'Simplify: 5x + 3x',
      type: 'solve',
      difficulty: 'easy',
      options: [],
      answer: '8x',
      solution: 'Combine like terms: 5x + 3x = 8x',
      hints: ['Add the coefficients: 5 + 3 = 8'],
      points: 10,
      createdAt: new Date()
    },
    {
      _id: 'practice-2-1-1',
      lessonId: 'lesson-2-1',
      question: 'Solve: x + 8 = 15',
      type: 'solve',
      difficulty: 'easy',
      options: [],
      answer: '7',
      solution: 'Subtract 8 from both sides: x = 15 - 8 = 7',
      hints: ['What do you need to subtract from both sides?'],
      points: 10,
      createdAt: new Date()
    },
    {
      _id: 'practice-2-2-1',
      lessonId: 'lesson-2-2',
      question: 'Solve: 3x + 5 = 20',
      type: 'solve',
      difficulty: 'medium',
      options: [],
      answer: '5',
      solution: 'Step 1: Subtract 5: 3x = 15. Step 2: Divide by 3: x = 5',
      hints: ['First subtract 5 from both sides', 'Then divide by 3'],
      points: 15,
      createdAt: new Date()
    }
  ];

  db.data.practices = db.data.practices || [];
  practices.forEach(practice => {
    if (!db.data.practices.find(p => p._id === practice._id)) {
      db.data.practices.push(practice);
    }
  });

  // Create Quizzes
  const quizzes = [
    {
      _id: 'quiz-module-1',
      moduleId: 'module-1',
      title: 'Algebra Fundamentals Quiz',
      description: 'Test your understanding of variables and expressions',
      timeLimit: 20,
      passingScore: 70,
      questions: [
        {
          _id: 'q1',
          question: 'What is a variable?',
          type: 'multiple-choice',
          options: [
            'A number that never changes',
            'A symbol that represents an unknown number',
            'A mathematical operation',
            'A type of equation'
          ],
          correctAnswer: 1,
          points: 10,
          explanation: 'A variable is a symbol (usually a letter) that represents an unknown number.'
        },
        {
          _id: 'q2',
          question: 'Simplify: 4x + 6x',
          type: 'multiple-choice',
          options: ['10x', '10x²', '24x', '10'],
          correctAnswer: 0,
          points: 10,
          explanation: 'Combine like terms: 4x + 6x = 10x'
        },
        {
          _id: 'q3',
          question: 'If x = 3, what is 5x - 2?',
          type: 'multiple-choice',
          options: ['11', '13', '15', '17'],
          correctAnswer: 1,
          points: 10,
          explanation: '5(3) - 2 = 15 - 2 = 13'
        }
      ],
      totalPoints: 30,
      createdAt: new Date()
    },
    {
      _id: 'quiz-module-2',
      moduleId: 'module-2',
      title: 'Linear Equations Quiz',
      description: 'Test your equation solving skills',
      timeLimit: 25,
      passingScore: 70,
      questions: [
        {
          _id: 'q1',
          question: 'Solve: x + 7 = 12',
          type: 'multiple-choice',
          options: ['x = 5', 'x = 19', 'x = 7', 'x = 12'],
          correctAnswer: 0,
          points: 10,
          explanation: 'Subtract 7 from both sides: x = 12 - 7 = 5'
        },
        {
          _id: 'q2',
          question: 'Solve: 2x + 4 = 14',
          type: 'multiple-choice',
          options: ['x = 5', 'x = 7', 'x = 9', 'x = 10'],
          correctAnswer: 0,
          points: 15,
          explanation: 'Subtract 4: 2x = 10. Divide by 2: x = 5'
        },
        {
          _id: 'q3',
          question: 'Solve: 3x - 6 = 15',
          type: 'multiple-choice',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
          correctAnswer: 2,
          points: 15,
          explanation: 'Add 6: 3x = 21. Divide by 3: x = 7'
        }
      ],
      totalPoints: 40,
      createdAt: new Date()
    }
  ];

  db.data.quizzes = db.data.quizzes || [];
  quizzes.forEach(quiz => {
    if (!db.data.quizzes.find(q => q._id === quiz._id)) {
      db.data.quizzes.push(quiz);
    }
  });

  await db.write();
  console.log('✅ Advanced course data seeded successfully!');
  console.log('📚 Course: Complete Algebra Mastery');
  console.log('📦 Modules: 3');
  console.log('📖 Lessons: 5');
  console.log('✏️ Practice Problems: 5');
  console.log('📝 Quizzes: 2');
}

seedAdvancedCourse().catch(console.error);
