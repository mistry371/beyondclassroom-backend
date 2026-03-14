const { db } = require('./database/db')

// Helper function to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

async function seedDemoCourse() {
  try {
    await db.read()

    console.log('🌱 Starting demo course seeding...')

    // Initialize arrays
    db.data.courses = db.data.courses || []
    db.data.modules = db.data.modules || []
    db.data.lessons = db.data.lessons || []
    db.data.practices = db.data.practices || []
    db.data.quizzes = db.data.quizzes || []

    // Create Demo Course
    const demoCourseId = generateId()
    const demoCourse = {
      _id: demoCourseId,
      title: '🎓 FREE Demo Course - Complete Algebra Mastery',
      description: 'A comprehensive FREE demo course showcasing all platform features including lessons, practice problems, quizzes, and progress tracking. Perfect for exploring Beyond Classroom!',
      category: 'Demo',
      difficulty: 'Intermediate',
      price: 0,
      discountPrice: 0,
      duration: '8 weeks',
      instructor: 'Beyond Classroom Team',
      rating: 5.0,
      enrolledCount: 0,
      topics: [
        'Linear Equations',
        'Quadratic Equations',
        'Functions and Graphs',
        'Polynomials'
      ],
      thumbnail: '/demo-course.jpg',
      featured: true,
      isPublished: true,
      isFree: true,
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.data.courses.push(demoCourse)
    console.log('✅ Demo course created')

    // Module 1: Linear Equations
    const module1Id = generateId()
    const lesson1_1Id = generateId()
    const lesson1_2Id = generateId()
    const quiz1Id = generateId()

    const module1 = {
      _id: module1Id,
      courseId: demoCourseId,
      title: 'Module 1: Introduction to Linear Equations',
      description: 'Learn the fundamentals of linear equations, solving techniques, and real-world applications.',
      order: 1,
      duration: '2 weeks',
      isLocked: false,
      lessons: [
        { _id: lesson1_1Id, title: 'Understanding Linear Equations', duration: '15 min', type: 'lesson' },
        { _id: lesson1_2Id, title: 'Solving Linear Equations', duration: '20 min', type: 'lesson' }
      ],
      quiz: { _id: quiz1Id, title: 'Module 1 Quiz', questions: [] },
      createdAt: new Date()
    }

    // Lesson 1.1: Understanding Linear Equations
    const lesson1_1 = {
      _id: lesson1_1Id,
      moduleId: module1Id,
      courseId: demoCourseId,
      title: 'Understanding Linear Equations',
      description: 'Introduction to linear equations and their basic properties',
      order: 1,
      duration: '15 min',
      type: 'lesson',
      content: {
        concept: `# Understanding Linear Equations

A **linear equation** is an algebraic equation in which each term is either a constant or the product of a constant and a single variable.

## Standard Form
The standard form of a linear equation is:
**ax + b = c**

Where:
- a, b, c are constants
- x is the variable
- a ≠ 0

## Key Properties
1. **Degree**: Linear equations have degree 1
2. **Graph**: They form straight lines when plotted
3. **Solution**: They have exactly one solution

## Real-World Examples
- Distance = Speed × Time
- Total Cost = Unit Price × Quantity
- Temperature Conversion: F = (9/5)C + 32`,
        examples: [
          `**Example 1: Simple Linear Equation**

Solve: 2x + 5 = 13

**Solution:**
Step 1: Subtract 5 from both sides
2x + 5 - 5 = 13 - 5
2x = 8

Step 2: Divide both sides by 2
x = 8/2
x = 4

**Answer: x = 4**`,
          `**Example 2: Equation with Negative Numbers**

Solve: -3x + 7 = -2

**Solution:**
Step 1: Subtract 7 from both sides
-3x = -2 - 7
-3x = -9

Step 2: Divide both sides by -3
x = -9/-3
x = 3

**Answer: x = 3**`
        ]
      },
      videoUrl: null,
      isPublished: true,
      createdAt: new Date()
    }

    // Practice problems for Lesson 1.1
    const practices1_1 = [
      {
        _id: generateId(),
        lessonId: lesson1_1Id,
        courseId: demoCourseId,
        question: 'Solve for x: 3x + 7 = 22',
        answer: '5',
        solution: `**Solution:**
Step 1: Subtract 7 from both sides
3x = 22 - 7
3x = 15

Step 2: Divide by 3
x = 15/3
x = 5`,
        difficulty: 'easy',
        points: 10,
        order: 1
      },
      {
        _id: generateId(),
        lessonId: lesson1_1Id,
        courseId: demoCourseId,
        question: 'Solve for x: 5x - 8 = 17',
        answer: '5',
        solution: `**Solution:**
Step 1: Add 8 to both sides
5x = 17 + 8
5x = 25

Step 2: Divide by 5
x = 25/5
x = 5`,
        difficulty: 'easy',
        points: 10,
        order: 2
      },
      {
        _id: generateId(),
        lessonId: lesson1_1Id,
        courseId: demoCourseId,
        question: 'Solve for x: -2x + 10 = 4',
        answer: '3',
        solution: `**Solution:**
Step 1: Subtract 10 from both sides
-2x = 4 - 10
-2x = -6

Step 2: Divide by -2
x = -6/-2
x = 3`,
        difficulty: 'medium',
        points: 15,
        order: 3
      }
    ]

    // Lesson 1.2: Solving Linear Equations
    const lesson1_2 = {
      _id: lesson1_2Id,
      moduleId: module1Id,
      courseId: demoCourseId,
      title: 'Solving Linear Equations',
      description: 'Advanced techniques for solving complex linear equations',
      order: 2,
      duration: '20 min',
      type: 'lesson',
      content: {
        concept: `# Solving Linear Equations - Advanced Techniques

## Multi-Step Equations
When solving equations with multiple operations, follow the order:
1. Simplify both sides (combine like terms)
2. Move variable terms to one side
3. Move constant terms to the other side
4. Isolate the variable

## Equations with Variables on Both Sides
**Example:** 3x + 5 = 2x + 9

**Steps:**
1. Move all x terms to one side: 3x - 2x = 9 - 5
2. Simplify: x = 4

## Equations with Fractions
**Tip:** Multiply all terms by the LCD (Least Common Denominator)

## Equations with Parentheses
**Remember:** Use the distributive property first
a(b + c) = ab + ac`,
        examples: [
          `**Example 1: Variables on Both Sides**

Solve: 4x + 7 = 2x + 15

**Solution:**
Step 1: Move variables to left side
4x - 2x = 15 - 7

Step 2: Simplify
2x = 8

Step 3: Divide by 2
x = 4

**Answer: x = 4**`,
          `**Example 2: Equation with Parentheses**

Solve: 3(x + 2) = 18

**Solution:**
Step 1: Distribute
3x + 6 = 18

Step 2: Subtract 6
3x = 12

Step 3: Divide by 3
x = 4

**Answer: x = 4**`
        ]
      },
      videoUrl: null,
      isPublished: true,
      createdAt: new Date()
    }

    // Practice problems for Lesson 1.2
    const practices1_2 = [
      {
        _id: generateId(),
        lessonId: lesson1_2Id,
        courseId: demoCourseId,
        question: 'Solve for x: 5x + 3 = 3x + 11',
        answer: '4',
        solution: `**Solution:**
Step 1: Move variables to one side
5x - 3x = 11 - 3
2x = 8

Step 2: Divide by 2
x = 4`,
        difficulty: 'medium',
        points: 15,
        order: 1
      },
      {
        _id: generateId(),
        lessonId: lesson1_2Id,
        courseId: demoCourseId,
        question: 'Solve for x: 2(x + 3) = 14',
        answer: '4',
        solution: `**Solution:**
Step 1: Distribute
2x + 6 = 14

Step 2: Subtract 6
2x = 8

Step 3: Divide by 2
x = 4`,
        difficulty: 'medium',
        points: 15,
        order: 2
      }
    ]

    // Quiz 1: Module 1 Quiz
    const quiz1 = {
      _id: quiz1Id,
      moduleId: module1Id,
      courseId: demoCourseId,
      title: 'Module 1: Linear Equations Quiz',
      description: 'Test your understanding of linear equations',
      timeLimit: 15,
      passingScore: 70,
      totalPoints: 100,
      questions: [
        {
          _id: generateId(),
          question: 'What is the solution to: 2x + 5 = 13?',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 'x = 4',
          explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
          points: 20
        },
        {
          _id: generateId(),
          question: 'Solve: 3x - 7 = 8',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
          correctAnswer: 'x = 5',
          explanation: 'Add 7 to both sides: 3x = 15, then divide by 3: x = 5',
          points: 20
        },
        {
          _id: generateId(),
          question: 'What is x in: 4x + 2 = 2x + 10?',
          options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
          correctAnswer: 'x = 4',
          explanation: 'Move variables: 4x - 2x = 10 - 2, so 2x = 8, therefore x = 4',
          points: 20
        },
        {
          _id: generateId(),
          question: 'Solve: 2(x + 3) = 16',
          options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
          correctAnswer: 'x = 5',
          explanation: 'Distribute: 2x + 6 = 16, subtract 6: 2x = 10, divide by 2: x = 5',
          points: 20
        },
        {
          _id: generateId(),
          question: 'What is the degree of a linear equation?',
          options: ['0', '1', '2', '3'],
          correctAnswer: '1',
          explanation: 'Linear equations have degree 1, meaning the highest power of the variable is 1',
          points: 20
        }
      ],
      isPublished: true,
      createdAt: new Date()
    }

    // Save Module 1 data
    db.data.modules.push(module1)
    db.data.lessons.push(lesson1_1, lesson1_2)
    db.data.practices.push(...practices1_1, ...practices1_2)
    db.data.quizzes.push(quiz1)
    console.log('✅ Module 1 created with lessons, practices, and quiz')

    // Module 2: Quadratic Equations
    const module2Id = generateId()
    const lesson2_1Id = generateId()
    const lesson2_2Id = generateId()
    const quiz2Id = generateId()

    const module2 = {
      _id: module2Id,
      courseId: demoCourseId,
      title: 'Module 2: Quadratic Equations',
      description: 'Master quadratic equations, factoring, and the quadratic formula.',
      order: 2,
      duration: '3 weeks',
      isLocked: false,
      lessons: [
        { _id: lesson2_1Id, title: 'Introduction to Quadratics', duration: '25 min', type: 'lesson' },
        { _id: lesson2_2Id, title: 'Solving by Factoring', duration: '30 min', type: 'lesson' }
      ],
      quiz: { _id: quiz2Id, title: 'Module 2 Quiz', questions: [] },
      createdAt: new Date()
    }

    // Lesson 2.1
    const lesson2_1 = {
      _id: lesson2_1Id,
      moduleId: module2Id,
      courseId: demoCourseId,
      title: 'Introduction to Quadratic Equations',
      description: 'Understanding quadratic equations and their properties',
      order: 1,
      duration: '25 min',
      type: 'lesson',
      content: {
        concept: `# Introduction to Quadratic Equations

A **quadratic equation** is a polynomial equation of degree 2.

## Standard Form
**ax² + bx + c = 0**

Where:
- a, b, c are constants
- a ≠ 0
- x is the variable

## Key Properties
1. **Degree**: Always 2
2. **Graph**: Forms a parabola
3. **Solutions**: Can have 0, 1, or 2 real solutions

## Types of Solutions
- **Two distinct real roots**: When discriminant > 0
- **One repeated root**: When discriminant = 0
- **No real roots**: When discriminant < 0

**Discriminant Formula:** b² - 4ac`,
        examples: [
          `**Example 1: Identifying Quadratic Equations**

Which of these are quadratic equations?
1. x² + 5x + 6 = 0 ✓ (Yes)
2. 3x + 7 = 0 ✗ (No, linear)
3. 2x² - 4 = 0 ✓ (Yes)
4. x³ + x² = 0 ✗ (No, cubic)`,
          `**Example 2: Standard Form**

Convert to standard form: x² = 5x - 6

**Solution:**
Move all terms to left side:
x² - 5x + 6 = 0

This is now in standard form (ax² + bx + c = 0)
where a=1, b=-5, c=6`
        ]
      },
      videoUrl: null,
      isPublished: true,
      createdAt: new Date()
    }

    // Practice for Lesson 2.1
    const practices2_1 = [
      {
        _id: generateId(),
        lessonId: lesson2_1Id,
        courseId: demoCourseId,
        question: 'Write in standard form: x² = 3x + 4',
        answer: 'x² - 3x - 4 = 0',
        solution: 'Move all terms to left: x² - 3x - 4 = 0',
        difficulty: 'easy',
        points: 10,
        order: 1
      },
      {
        _id: generateId(),
        lessonId: lesson2_1Id,
        courseId: demoCourseId,
        question: 'What is the discriminant of x² + 4x + 4 = 0?',
        answer: '0',
        solution: 'Discriminant = b² - 4ac = 16 - 16 = 0',
        difficulty: 'medium',
        points: 15,
        order: 2
      }
    ]

    // Lesson 2.2
    const lesson2_2 = {
      _id: lesson2_2Id,
      moduleId: module2Id,
      courseId: demoCourseId,
      title: 'Solving Quadratic Equations by Factoring',
      description: 'Learn to solve quadratic equations using factoring method',
      order: 2,
      duration: '30 min',
      type: 'lesson',
      content: {
        concept: `# Solving by Factoring

## Zero Product Property
If ab = 0, then either a = 0 or b = 0

## Steps to Solve by Factoring
1. Write equation in standard form
2. Factor the quadratic expression
3. Set each factor equal to zero
4. Solve for x

## Common Factoring Patterns
- **x² + (a+b)x + ab = (x + a)(x + b)**
- **Difference of squares: a² - b² = (a + b)(a - b)**
- **Perfect square: a² + 2ab + b² = (a + b)²**`,
        examples: [
          `**Example 1: Simple Factoring**

Solve: x² + 5x + 6 = 0

**Solution:**
Step 1: Factor
(x + 2)(x + 3) = 0

Step 2: Apply zero product property
x + 2 = 0  OR  x + 3 = 0

Step 3: Solve
x = -2  OR  x = -3

**Answer: x = -2 or x = -3**`,
          `**Example 2: Difference of Squares**

Solve: x² - 9 = 0

**Solution:**
Step 1: Recognize pattern (a² - b²)
(x + 3)(x - 3) = 0

Step 2: Solve
x = -3  OR  x = 3

**Answer: x = ±3**`
        ]
      },
      videoUrl: null,
      isPublished: true,
      createdAt: new Date()
    }

    // Practice for Lesson 2.2
    const practices2_2 = [
      {
        _id: generateId(),
        lessonId: lesson2_2Id,
        courseId: demoCourseId,
        question: 'Solve by factoring: x² + 7x + 12 = 0',
        answer: 'x = -3 or x = -4',
        solution: 'Factor: (x + 3)(x + 4) = 0, so x = -3 or x = -4',
        difficulty: 'medium',
        points: 15,
        order: 1
      },
      {
        _id: generateId(),
        lessonId: lesson2_2Id,
        courseId: demoCourseId,
        question: 'Solve: x² - 16 = 0',
        answer: 'x = 4 or x = -4',
        solution: 'Factor: (x + 4)(x - 4) = 0, so x = ±4',
        difficulty: 'easy',
        points: 10,
        order: 2
      }
    ]

    // Quiz 2
    const quiz2 = {
      _id: quiz2Id,
      moduleId: module2Id,
      courseId: demoCourseId,
      title: 'Module 2: Quadratic Equations Quiz',
      description: 'Test your knowledge of quadratic equations',
      timeLimit: 20,
      passingScore: 70,
      totalPoints: 100,
      questions: [
        {
          _id: generateId(),
          question: 'What is the standard form of a quadratic equation?',
          options: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx² + c = 0', 'ax² = c'],
          correctAnswer: 'ax² + bx + c = 0',
          explanation: 'The standard form is ax² + bx + c = 0 where a ≠ 0',
          points: 20
        },
        {
          _id: generateId(),
          question: 'Solve by factoring: x² + 6x + 8 = 0',
          options: ['x = -2 or x = -4', 'x = 2 or x = 4', 'x = -1 or x = -8', 'x = 1 or x = 8'],
          correctAnswer: 'x = -2 or x = -4',
          explanation: 'Factor: (x + 2)(x + 4) = 0, giving x = -2 or x = -4',
          points: 25
        },
        {
          _id: generateId(),
          question: 'What is the discriminant formula?',
          options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', 'b - 4ac'],
          correctAnswer: 'b² - 4ac',
          explanation: 'The discriminant is b² - 4ac, used to determine the nature of roots',
          points: 20
        },
        {
          _id: generateId(),
          question: 'Solve: x² - 25 = 0',
          options: ['x = ±5', 'x = ±25', 'x = 5', 'x = -5'],
          correctAnswer: 'x = ±5',
          explanation: 'This is difference of squares: (x+5)(x-5) = 0, so x = ±5',
          points: 20
        },
        {
          _id: generateId(),
          question: 'How many real solutions can a quadratic equation have?',
          options: ['0, 1, or 2', 'Always 2', 'Always 1', '1 or 2'],
          correctAnswer: '0, 1, or 2',
          explanation: 'Depending on the discriminant, a quadratic can have 0, 1, or 2 real solutions',
          points: 15
        }
      ],
      isPublished: true,
      createdAt: new Date()
    }

    // Save Module 2 data
    db.data.modules.push(module2)
    db.data.lessons.push(lesson2_1, lesson2_2)
    db.data.practices.push(...practices2_1, ...practices2_2)
    db.data.quizzes.push(quiz2)
    console.log('✅ Module 2 created with lessons, practices, and quiz')

    // Save all data
    await db.write()

    // Auto-enroll all existing users in the free demo course
    let enrolledCount = 0
    if (db.data.users && db.data.users.length > 0) {
      for (const user of db.data.users) {
        if (!user.purchasedCourses) {
          user.purchasedCourses = []
        }
        if (!user.purchasedCourses.includes(demoCourseId)) {
          user.purchasedCourses.push(demoCourseId)
          enrolledCount++

          // Create progress record for each user
          const progressRecord = {
            _id: generateId(),
            userId: user._id,
            courseId: demoCourseId,
            completionPercentage: 0,
            lessonsCompleted: [],
            quizzesCompleted: [],
            practiceAccuracy: 0,
            quizScores: [],
            timeSpent: 0,
            lastAccessedAt: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for demo
            createdAt: new Date()
          }
          db.data.progress = db.data.progress || []
          db.data.progress.push(progressRecord)
        }
      }
      console.log(`✅ Auto-enrolled ${enrolledCount} existing users`)
    }

    console.log('\n🎉 Demo course seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - 1 FREE Demo Course: "${demoCourse.title}"`)
    console.log(`   - 2 Modules`)
    console.log(`   - 4 Lessons`)
    console.log(`   - 7 Practice Problems`)
    console.log(`   - 2 Quizzes (10 questions total)`)
    console.log(`   - ${enrolledCount} users auto-enrolled`)
    console.log('\n💡 Features:')
    console.log(`   ✅ Completely FREE`)
    console.log(`   ✅ Auto-enrolled for all users`)
    console.log(`   ✅ Available in Dashboard immediately`)
    console.log(`   ✅ No payment required`)
    console.log('\n🚀 Access:')
    console.log(`   1. Login to any account`)
    console.log(`   2. Go to Dashboard → My Courses`)
    console.log(`   3. Demo course is already there!`)
    console.log(`   4. Click "Continue Learning"`)
    console.log(`\n✨ Course ID: ${demoCourseId}`)

  } catch (error) {
    console.error('❌ Error seeding demo course:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoCourse()
    .then(() => {
      console.log('\n✅ Seeding complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedDemoCourse }
