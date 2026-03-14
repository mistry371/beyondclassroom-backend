const { db } = require('./database/db')

// Simple ID generator
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function seedAdvancedCourse() {
  await db.read()

  // Initialize arrays if they don't exist
  db.data.courses = db.data.courses || []
  db.data.modules = db.data.modules || []
  db.data.lessons = db.data.lessons || []

  // Create Advanced Calculus Course
  const advancedCourseId = generateId('course')
  const advancedCourse = {
    _id: advancedCourseId,
    title: 'Advanced Calculus & Analysis',
    description: 'Master advanced calculus concepts including multivariable calculus, vector calculus, differential equations, and real analysis. Perfect for JEE Advanced, Olympiad preparation, and university-level mathematics.',
    category: 'Advanced Mathematics',
    difficulty: 'Advanced',
    price: 4999,
    instructor: 'Dr. Rajesh Kumar (IIT Delhi)',
    duration: '16 weeks',
    topics: [
      'Multivariable Calculus',
      'Vector Calculus',
      'Differential Equations',
      'Real Analysis',
      'Complex Analysis',
      'Fourier Series',
      'Laplace Transforms'
    ],
    thumbnail: '/courses/advanced-calculus.jpg',
    isFeatured: true,
    enrolledCount: 1247,
    rating: 4.9,
    createdAt: new Date()
  }

  db.data.courses.push(advancedCourse)

  // Module 1: Multivariable Calculus
  const module1Id = generateId('module')
  const module1 = {
    _id: module1Id,
    courseId: advancedCourseId,
    title: 'Multivariable Calculus',
    description: 'Functions of several variables, partial derivatives, and multiple integrals',
    order: 1,
    duration: '4 weeks',
    createdAt: new Date()
  }
  db.data.modules.push(module1)

  // Lessons for Module 1
  const module1Lessons = [
    {
      _id: generateId('lesson'),
      moduleId: module1Id,
      courseId: advancedCourseId,
      title: 'Functions of Several Variables',
      description: 'Introduction to functions with multiple inputs and their domains',
      type: 'video',
      duration: '45 min',
      order: 1,
      isLocked: false,
      content: {
        concept: `
          <h2>Functions of Several Variables</h2>
          <p>A function of several variables is a function that takes multiple inputs and produces a single output. For example, f(x, y) = x² + y² is a function of two variables.</p>
          
          <h3>Domain and Range</h3>
          <p>The <strong>domain</strong> of a multivariable function is the set of all possible input values. For f(x, y) = √(1 - x² - y²), the domain is the set of all (x, y) such that x² + y² ≤ 1 (a disk of radius 1).</p>
          
          <h3>Visualizing Multivariable Functions</h3>
          <ul>
            <li><strong>Level Curves:</strong> For f(x, y), level curves are curves where f(x, y) = c for constant c</li>
            <li><strong>3D Graphs:</strong> The graph of z = f(x, y) is a surface in 3D space</li>
            <li><strong>Contour Maps:</strong> Collection of level curves showing function behavior</li>
          </ul>
          
          <h3>Examples</h3>
          <p><strong>Example 1:</strong> f(x, y) = x² + y²</p>
          <p>This represents a paraboloid opening upward. Level curves are circles centered at origin.</p>
          
          <p><strong>Example 2:</strong> f(x, y) = xy</p>
          <p>This represents a saddle surface. Level curves are hyperbolas.</p>
        `,
        summary: 'Functions of several variables extend single-variable calculus to higher dimensions. Understanding domains, ranges, and visualization techniques is crucial for advanced calculus.'
      },
      createdAt: new Date()
    },
    {
      _id: generateId('lesson'),
      moduleId: module1Id,
      courseId: advancedCourseId,
      title: 'Partial Derivatives',
      description: 'Computing derivatives with respect to one variable while holding others constant',
      type: 'video',
      duration: '50 min',
      order: 2,
      isLocked: false,
      content: {
        concept: `
          <h2>Partial Derivatives</h2>
          <p>A <strong>partial derivative</strong> measures how a function changes as one variable changes while keeping all other variables constant.</p>
          
          <h3>Notation</h3>
          <p>For f(x, y), the partial derivatives are:</p>
          <ul>
            <li>∂f/∂x or fₓ: derivative with respect to x (treat y as constant)</li>
            <li>∂f/∂y or fᵧ: derivative with respect to y (treat x as constant)</li>
          </ul>
          
          <h3>Computing Partial Derivatives</h3>
          <p><strong>Example:</strong> f(x, y) = x³y² + 2xy + y³</p>
          <p>∂f/∂x = 3x²y² + 2y (treat y as constant)</p>
          <p>∂f/∂y = 2x³y + 2x + 3y² (treat x as constant)</p>
          
          <h3>Higher Order Partial Derivatives</h3>
          <ul>
            <li><strong>Second partial derivatives:</strong> ∂²f/∂x², ∂²f/∂y²</li>
            <li><strong>Mixed partial derivatives:</strong> ∂²f/∂x∂y, ∂²f/∂y∂x</li>
            <li><strong>Clairaut's Theorem:</strong> If mixed partials are continuous, then ∂²f/∂x∂y = ∂²f/∂y∂x</li>
          </ul>
          
          <h3>Applications</h3>
          <p>Partial derivatives are used in:</p>
          <ul>
            <li>Optimization problems (finding maxima and minima)</li>
            <li>Physics (heat equation, wave equation)</li>
            <li>Economics (marginal analysis)</li>
            <li>Machine learning (gradient descent)</li>
          </ul>
        `,
        summary: 'Partial derivatives extend the concept of derivatives to multivariable functions. They are fundamental for optimization, physics, and many applications in science and engineering.'
      },
      createdAt: new Date()
    },
    {
      _id: generateId('lesson'),
      moduleId: module1Id,
      courseId: advancedCourseId,
      title: 'Chain Rule for Multivariable Functions',
      description: 'Extending the chain rule to functions of several variables',
      type: 'video',
      duration: '55 min',
      order: 3,
      isLocked: false,
      content: {
        concept: `
          <h2>Multivariable Chain Rule</h2>
          <p>The chain rule for multivariable functions allows us to compute derivatives of composite functions.</p>
          
          <h3>Case 1: One Independent Variable</h3>
          <p>If z = f(x, y) where x = g(t) and y = h(t), then:</p>
          <p><code>dz/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt)</code></p>
          
          <h3>Case 2: Multiple Independent Variables</h3>
          <p>If z = f(x, y) where x = g(s, t) and y = h(s, t), then:</p>
          <p><code>∂z/∂s = (∂f/∂x)(∂x/∂s) + (∂f/∂y)(∂y/∂s)</code></p>
          <p><code>∂z/∂t = (∂f/∂x)(∂x/∂t) + (∂f/∂y)(∂y/∂t)</code></p>
          
          <h3>Example Problem</h3>
          <p><strong>Given:</strong> z = x²y, x = cos(t), y = sin(t)</p>
          <p><strong>Find:</strong> dz/dt</p>
          <p><strong>Solution:</strong></p>
          <ul>
            <li>∂z/∂x = 2xy</li>
            <li>∂z/∂y = x²</li>
            <li>dx/dt = -sin(t)</li>
            <li>dy/dt = cos(t)</li>
            <li>dz/dt = (2xy)(-sin(t)) + (x²)(cos(t))</li>
            <li>dz/dt = 2cos(t)sin(t)(-sin(t)) + cos²(t)cos(t)</li>
            <li>dz/dt = -2cos(t)sin²(t) + cos³(t)</li>
          </ul>
        `,
        summary: 'The multivariable chain rule is essential for computing derivatives of composite functions and appears frequently in physics, engineering, and optimization problems.'
      },
      createdAt: new Date()
    }
  ]

  db.data.lessons.push(...module1Lessons)

  // Module 2: Vector Calculus
  const module2Id = generateId('lesson')
  const module2 = {
    _id: module2Id,
    courseId: advancedCourseId,
    title: 'Vector Calculus',
    description: 'Vector fields, line integrals, surface integrals, and fundamental theorems',
    order: 2,
    duration: '4 weeks',
    createdAt: new Date()
  }
  db.data.modules.push(module2)

  // Lessons for Module 2
  const module2Lessons = [
    {
      _id: generateId('lesson'),
      moduleId: module2Id,
      courseId: advancedCourseId,
      title: 'Vector Fields',
      description: 'Introduction to vector fields and their properties',
      type: 'video',
      duration: '40 min',
      order: 1,
      isLocked: false,
      content: {
        concept: `
          <h2>Vector Fields</h2>
          <p>A <strong>vector field</strong> assigns a vector to each point in space. In 2D: F(x, y) = P(x, y)i + Q(x, y)j</p>
          
          <h3>Examples of Vector Fields</h3>
          <ul>
            <li><strong>Gravitational field:</strong> F = -GMm/r² r̂</li>
            <li><strong>Electric field:</strong> E = kQ/r² r̂</li>
            <li><strong>Velocity field:</strong> v(x, y) = -yi + xj (rotation)</li>
            <li><strong>Gradient field:</strong> ∇f = (∂f/∂x)i + (∂f/∂y)j</li>
          </ul>
          
          <h3>Conservative Vector Fields</h3>
          <p>A vector field F is <strong>conservative</strong> if there exists a scalar function f such that F = ∇f. The function f is called the potential function.</p>
          
          <h3>Test for Conservative Fields</h3>
          <p>In 2D, F = Pi + Qj is conservative if and only if:</p>
          <p><code>∂P/∂y = ∂Q/∂x</code></p>
          
          <h3>Example</h3>
          <p><strong>Is F = (2xy + 3)i + (x² - 4y)j conservative?</strong></p>
          <p>Check: ∂P/∂y = 2x, ∂Q/∂x = 2x ✓</p>
          <p>Yes, it's conservative! To find potential: f(x,y) = x²y + 3x - 2y² + C</p>
        `,
        summary: 'Vector fields are fundamental in physics and engineering. Conservative fields have special properties that simplify many calculations.'
      },
      createdAt: new Date()
    },
    {
      _id: generateId('lesson'),
      moduleId: module2Id,
      courseId: advancedCourseId,
      title: 'Line Integrals',
      description: 'Computing integrals along curves in vector fields',
      type: 'video',
      duration: '60 min',
      order: 2,
      isLocked: false,
      content: {
        concept: `
          <h2>Line Integrals</h2>
          <p>A <strong>line integral</strong> computes the integral of a function along a curve in space.</p>
          
          <h3>Line Integral of a Scalar Function</h3>
          <p>∫_C f(x, y) ds = ∫ₐᵇ f(r(t)) |r'(t)| dt</p>
          <p>where C is parameterized by r(t) for a ≤ t ≤ b</p>
          
          <h3>Line Integral of a Vector Field</h3>
          <p>∫_C F · dr = ∫ₐᵇ F(r(t)) · r'(t) dt</p>
          <p>This represents work done by force field F along curve C</p>
          
          <h3>Properties</h3>
          <ul>
            <li><strong>Path independence:</strong> For conservative fields, ∫_C F · dr depends only on endpoints</li>
            <li><strong>Fundamental theorem:</strong> If F = ∇f, then ∫_C F · dr = f(B) - f(A)</li>
            <li><strong>Closed curves:</strong> For conservative F, ∮_C F · dr = 0</li>
          </ul>
          
          <h3>Example Problem</h3>
          <p><strong>Compute:</strong> ∫_C (x² + y²) ds where C is the circle x² + y² = 4</p>
          <p><strong>Parameterization:</strong> r(t) = (2cos(t), 2sin(t)), 0 ≤ t ≤ 2π</p>
          <p><strong>Solution:</strong></p>
          <ul>
            <li>r'(t) = (-2sin(t), 2cos(t))</li>
            <li>|r'(t)| = 2</li>
            <li>f(r(t)) = 4cos²(t) + 4sin²(t) = 4</li>
            <li>∫_C (x² + y²) ds = ∫₀²π 4 · 2 dt = 16π</li>
          </ul>
        `,
        summary: 'Line integrals extend integration to curves in space and are crucial for computing work, circulation, and flux in physics and engineering.'
      },
      createdAt: new Date()
    }
  ]

  db.data.lessons.push(...module2Lessons)

  // Module 3: Differential Equations
  const module3Id = generateId('lesson')
  const module3 = {
    _id: module3Id,
    courseId: advancedCourseId,
    title: 'Differential Equations',
    description: 'First and second order ODEs, systems of equations, and applications',
    order: 3,
    duration: '4 weeks',
    createdAt: new Date()
  }
  db.data.modules.push(module3)

  // Lessons for Module 3
  const module3Lessons = [
    {
      _id: generateId('lesson'),
      moduleId: module3Id,
      courseId: advancedCourseId,
      title: 'First Order Differential Equations',
      description: 'Separable, linear, and exact differential equations',
      type: 'video',
      duration: '50 min',
      order: 1,
      isLocked: false,
      content: {
        concept: `
          <h2>First Order Differential Equations</h2>
          <p>A first order ODE has the form: dy/dx = f(x, y)</p>
          
          <h3>Separable Equations</h3>
          <p>Form: dy/dx = g(x)h(y)</p>
          <p>Solution method: Separate variables and integrate</p>
          <p><code>∫ dy/h(y) = ∫ g(x) dx</code></p>
          
          <h3>Linear First Order ODEs</h3>
          <p>Form: dy/dx + P(x)y = Q(x)</p>
          <p>Solution using integrating factor μ(x) = e^(∫P(x)dx):</p>
          <p><code>y = (1/μ(x)) ∫ μ(x)Q(x) dx</code></p>
          
          <h3>Example: Population Growth</h3>
          <p><strong>Problem:</strong> dP/dt = kP (exponential growth)</p>
          <p><strong>Solution:</strong></p>
          <ul>
            <li>Separable: dP/P = k dt</li>
            <li>Integrate: ln|P| = kt + C</li>
            <li>Solution: P(t) = P₀e^(kt)</li>
          </ul>
          
          <h3>Example: Newton's Law of Cooling</h3>
          <p><strong>Problem:</strong> dT/dt = -k(T - Tₐ)</p>
          <p>where T is temperature, Tₐ is ambient temperature</p>
          <p><strong>Solution:</strong> T(t) = Tₐ + (T₀ - Tₐ)e^(-kt)</p>
        `,
        summary: 'First order ODEs model many real-world phenomena including population growth, radioactive decay, and cooling processes.'
      },
      createdAt: new Date()
    },
    {
      _id: generateId('lesson'),
      moduleId: module3Id,
      courseId: advancedCourseId,
      title: 'Second Order Linear ODEs',
      description: 'Homogeneous and non-homogeneous equations with constant coefficients',
      type: 'video',
      duration: '65 min',
      order: 2,
      isLocked: false,
      content: {
        concept: `
          <h2>Second Order Linear ODEs</h2>
          <p>General form: ay'' + by' + cy = f(x)</p>
          
          <h3>Homogeneous Equations (f(x) = 0)</h3>
          <p>ay'' + by' + cy = 0</p>
          <p><strong>Characteristic equation:</strong> ar² + br + c = 0</p>
          
          <h3>Three Cases for Solutions</h3>
          <ul>
            <li><strong>Distinct real roots r₁, r₂:</strong> y = C₁e^(r₁x) + C₂e^(r₂x)</li>
            <li><strong>Repeated root r:</strong> y = (C₁ + C₂x)e^(rx)</li>
            <li><strong>Complex roots α ± βi:</strong> y = e^(αx)(C₁cos(βx) + C₂sin(βx))</li>
          </ul>
          
          <h3>Example: Simple Harmonic Motion</h3>
          <p><strong>Equation:</strong> y'' + ω²y = 0</p>
          <p><strong>Characteristic equation:</strong> r² + ω² = 0</p>
          <p><strong>Roots:</strong> r = ±ωi</p>
          <p><strong>Solution:</strong> y = C₁cos(ωx) + C₂sin(ωx)</p>
          
          <h3>Non-Homogeneous Equations</h3>
          <p>General solution: y = y_h + y_p</p>
          <ul>
            <li>y_h: homogeneous solution</li>
            <li>y_p: particular solution (use method of undetermined coefficients or variation of parameters)</li>
          </ul>
          
          <h3>Applications</h3>
          <ul>
            <li>Spring-mass systems</li>
            <li>RLC circuits</li>
            <li>Vibrations and oscillations</li>
            <li>Wave propagation</li>
          </ul>
        `,
        summary: 'Second order ODEs are fundamental in physics and engineering, modeling oscillations, vibrations, and wave phenomena.'
      },
      createdAt: new Date()
    }
  ]

  db.data.lessons.push(...module3Lessons)

  // Module 4: Real Analysis
  const module4Id = generateId('lesson')
  const module4 = {
    _id: module4Id,
    courseId: advancedCourseId,
    title: 'Introduction to Real Analysis',
    description: 'Sequences, series, limits, continuity, and rigorous proofs',
    order: 4,
    duration: '4 weeks',
    createdAt: new Date()
  }
  db.data.modules.push(module4)

  // Lessons for Module 4
  const module4Lessons = [
    {
      _id: generateId('lesson'),
      moduleId: module4Id,
      courseId: advancedCourseId,
      title: 'Sequences and Convergence',
      description: 'Rigorous definition of limits and convergence of sequences',
      type: 'video',
      duration: '55 min',
      order: 1,
      isLocked: false,
      content: {
        concept: `
          <h2>Sequences and Convergence</h2>
          <p>A <strong>sequence</strong> is a function from natural numbers to real numbers: {aₙ} = a₁, a₂, a₃, ...</p>
          
          <h3>Formal Definition of Limit</h3>
          <p>A sequence {aₙ} converges to L if:</p>
          <p>For every ε > 0, there exists N such that for all n > N, |aₙ - L| < ε</p>
          <p>Notation: lim(n→∞) aₙ = L</p>
          
          <h3>Properties of Convergent Sequences</h3>
          <ul>
            <li><strong>Uniqueness:</strong> A sequence can have at most one limit</li>
            <li><strong>Boundedness:</strong> Every convergent sequence is bounded</li>
            <li><strong>Algebra of limits:</strong> lim(aₙ + bₙ) = lim(aₙ) + lim(bₙ)</li>
            <li><strong>Squeeze theorem:</strong> If aₙ ≤ bₙ ≤ cₙ and lim(aₙ) = lim(cₙ) = L, then lim(bₙ) = L</li>
          </ul>
          
          <h3>Important Examples</h3>
          <p><strong>Example 1:</strong> aₙ = 1/n → 0</p>
          <p>Proof: Given ε > 0, choose N > 1/ε. Then for n > N: |1/n - 0| = 1/n < 1/N < ε</p>
          
          <p><strong>Example 2:</strong> aₙ = (1 + 1/n)ⁿ → e</p>
          <p>This is the definition of Euler's number e ≈ 2.71828...</p>
          
          <h3>Monotone Convergence Theorem</h3>
          <p>Every bounded monotone sequence converges.</p>
          <p>This is a powerful tool for proving convergence without finding the limit explicitly.</p>
        `,
        summary: 'Understanding sequences and their convergence is fundamental to real analysis and provides the rigorous foundation for calculus.'
      },
      createdAt: new Date()
    },
    {
      _id: generateId('lesson'),
      moduleId: module4Id,
      courseId: advancedCourseId,
      title: 'Series and Convergence Tests',
      description: 'Infinite series and tests for convergence',
      type: 'video',
      duration: '60 min',
      order: 2,
      isLocked: false,
      content: {
        concept: `
          <h2>Infinite Series</h2>
          <p>An <strong>infinite series</strong> is the sum of infinitely many terms: Σ(n=1 to ∞) aₙ</p>
          
          <h3>Convergence Tests</h3>
          
          <p><strong>1. Divergence Test (nth Term Test)</strong></p>
          <p>If lim(n→∞) aₙ ≠ 0, then Σaₙ diverges</p>
          <p>Note: If lim(aₙ) = 0, the series may converge or diverge</p>
          
          <p><strong>2. Comparison Test</strong></p>
          <p>If 0 ≤ aₙ ≤ bₙ for all n:</p>
          <ul>
            <li>If Σbₙ converges, then Σaₙ converges</li>
            <li>If Σaₙ diverges, then Σbₙ diverges</li>
          </ul>
          
          <p><strong>3. Ratio Test</strong></p>
          <p>Let L = lim(n→∞) |aₙ₊₁/aₙ|</p>
          <ul>
            <li>If L < 1, series converges absolutely</li>
            <li>If L > 1, series diverges</li>
            <li>If L = 1, test is inconclusive</li>
          </ul>
          
          <p><strong>4. Root Test</strong></p>
          <p>Let L = lim(n→∞) ⁿ√|aₙ|</p>
          <ul>
            <li>If L < 1, series converges absolutely</li>
            <li>If L > 1, series diverges</li>
            <li>If L = 1, test is inconclusive</li>
          </ul>
          
          <h3>Important Series</h3>
          <p><strong>Geometric series:</strong> Σ(n=0 to ∞) arⁿ = a/(1-r) if |r| < 1</p>
          <p><strong>p-series:</strong> Σ(n=1 to ∞) 1/nᵖ converges if p > 1, diverges if p ≤ 1</p>
          <p><strong>Harmonic series:</strong> Σ(n=1 to ∞) 1/n diverges</p>
          
          <h3>Example</h3>
          <p><strong>Test convergence:</strong> Σ(n=1 to ∞) n/2ⁿ</p>
          <p>Using ratio test: L = lim((n+1)/2ⁿ⁺¹ · 2ⁿ/n) = lim((n+1)/(2n)) = 1/2 < 1</p>
          <p>Therefore, the series converges.</p>
        `,
        summary: 'Series convergence tests are essential tools in analysis, allowing us to determine whether infinite sums converge without computing them explicitly.'
      },
      createdAt: new Date()
    }
  ]

  db.data.lessons.push(...module4Lessons)

  await db.write()

  console.log('✅ Advanced course created successfully!')
  console.log(`📚 Course: ${advancedCourse.title}`)
  console.log(`📖 Modules: ${db.data.modules.filter(m => m.courseId === advancedCourseId).length}`)
  console.log(`📝 Lessons: ${db.data.lessons.filter(l => l.courseId === advancedCourseId).length}`)
}

seedAdvancedCourse().catch(console.error)
