const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const path = require('path')

// Initialize database
const file = path.join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, {})

// Initialize default data
async function initDB() {
  await db.read()
  db.data = db.data || {
    users: [],
    courses: [],
    cart: [],
    orders: [],
    notifications: [],
    modules: [],
    lessons: [],
    practices: [],
    quizzes: [],
    progress: [],
    otps: []
  }
  
  // Add sample courses if empty
  if (db.data.courses.length === 0) {
    db.data.courses = [
      {
        _id: '1',
        title: 'Advanced Calculus & Analysis',
        description: 'Master advanced calculus concepts including multivariable calculus, vector calculus, differential equations, and real analysis',
        category: 'Calculus',
        difficulty: 'Advanced',
        price: 99.99,
        instructor: 'Dr. Sarah Johnson, PhD Mathematics',
        duration: '16 weeks',
        topics: ['Multivariable Calculus', 'Vector Calculus', 'Differential Equations', 'Real Analysis', 'Complex Analysis', 'Fourier Series'],
        content: [
          {
            title: 'Module 1: Multivariable Functions',
            description: 'Understanding functions of multiple variables and their properties',
            duration: '2 hours',
            videoUrl: '/videos/module1.mp4',
            content: `
              <h2>Introduction to Multivariable Functions</h2>
              <p>A function of multiple variables is a function that takes two or more input values and produces a single output.</p>
              
              <h3>Key Concepts:</h3>
              <ul>
                <li><strong>Domain and Range:</strong> For f(x,y), the domain is a subset of ℝ² and range is in ℝ</li>
                <li><strong>Level Curves:</strong> Curves where f(x,y) = c for constant c</li>
                <li><strong>Partial Derivatives:</strong> Rate of change with respect to one variable</li>
              </ul>

              <h3>Example: Temperature Distribution</h3>
              <p>Consider temperature T(x,y) = 100 - x² - y²</p>
              <p>This represents a temperature field where temperature decreases as we move away from origin.</p>

              <h3>Partial Derivatives:</h3>
              <p>∂T/∂x = -2x (rate of temperature change in x-direction)</p>
              <p>∂T/∂y = -2y (rate of temperature change in y-direction)</p>

              <h3>Practice Problems:</h3>
              <ol>
                <li>Find ∂f/∂x and ∂f/∂y for f(x,y) = x³y² + 2xy - 5</li>
                <li>Sketch level curves for f(x,y) = x² + y² at c = 1, 4, 9</li>
                <li>Find the gradient vector ∇f at point (1,2)</li>
              </ol>
            `,
            completed: false
          },
          {
            title: 'Module 2: Partial Derivatives & Gradient',
            description: 'Deep dive into partial differentiation and gradient vectors',
            duration: '2.5 hours',
            videoUrl: '/videos/module2.mp4',
            content: `
              <h2>Partial Derivatives and the Gradient</h2>
              
              <h3>Partial Derivatives</h3>
              <p>For a function f(x,y), partial derivatives measure the rate of change in each direction:</p>
              <ul>
                <li>∂f/∂x: derivative with respect to x (treating y as constant)</li>
                <li>∂f/∂y: derivative with respect to y (treating x as constant)</li>
              </ul>

              <h3>The Gradient Vector</h3>
              <p>The gradient ∇f = (∂f/∂x, ∂f/∂y) points in the direction of steepest ascent.</p>
              
              <h3>Properties:</h3>
              <ul>
                <li>∇f is perpendicular to level curves</li>
                <li>||∇f|| gives the maximum rate of change</li>
                <li>-∇f points in direction of steepest descent</li>
              </ul>

              <h3>Example: Optimization</h3>
              <p>Find critical points of f(x,y) = x² + y² - 4x - 6y + 13</p>
              <p>Solution: Set ∇f = 0</p>
              <p>∂f/∂x = 2x - 4 = 0 → x = 2</p>
              <p>∂f/∂y = 2y - 6 = 0 → y = 3</p>
              <p>Critical point: (2, 3)</p>

              <h3>Directional Derivatives</h3>
              <p>Rate of change in direction of unit vector u:</p>
              <p>D_u f = ∇f · u</p>
            `,
            completed: false
          },
          {
            title: 'Module 3: Multiple Integrals',
            description: 'Double and triple integrals with applications',
            duration: '3 hours',
            videoUrl: '/videos/module3.mp4',
            content: `
              <h2>Multiple Integrals</h2>
              
              <h3>Double Integrals</h3>
              <p>∫∫_R f(x,y) dA represents volume under surface f(x,y) over region R</p>
              
              <h3>Evaluation Methods:</h3>
              <ol>
                <li><strong>Rectangular Coordinates:</strong> ∫∫ f(x,y) dx dy</li>
                <li><strong>Polar Coordinates:</strong> ∫∫ f(r,θ) r dr dθ</li>
              </ol>

              <h3>Example: Volume Calculation</h3>
              <p>Find volume under z = 4 - x² - y² above xy-plane</p>
              <p>Using polar coordinates: x = r cos θ, y = r sin θ</p>
              <p>V = ∫₀²π ∫₀² (4 - r²) r dr dθ</p>
              <p>V = 2π ∫₀² (4r - r³) dr = 2π [2r² - r⁴/4]₀² = 8π</p>

              <h3>Applications:</h3>
              <ul>
                <li>Volume calculations</li>
                <li>Mass and center of mass</li>
                <li>Surface area</li>
                <li>Probability distributions</li>
              </ul>

              <h3>Triple Integrals</h3>
              <p>∫∫∫_E f(x,y,z) dV for 3D regions</p>
              <p>Coordinate systems: Rectangular, Cylindrical, Spherical</p>
            `,
            completed: false
          },
          {
            title: 'Module 4: Vector Calculus',
            description: 'Line integrals, surface integrals, and fundamental theorems',
            duration: '3.5 hours',
            videoUrl: '/videos/module4.mp4',
            content: `
              <h2>Vector Calculus</h2>
              
              <h3>Vector Fields</h3>
              <p>A vector field F assigns a vector to each point in space:</p>
              <p>F(x,y) = P(x,y)i + Q(x,y)j</p>
              
              <h3>Line Integrals</h3>
              <p>∫_C F · dr measures work done by force field F along curve C</p>
              
              <h3>Fundamental Theorem for Line Integrals</h3>
              <p>If F = ∇f (conservative field), then:</p>
              <p>∫_C F · dr = f(B) - f(A)</p>
              <p>where A and B are endpoints of C</p>

              <h3>Green's Theorem</h3>
              <p>Relates line integral around closed curve to double integral over region:</p>
              <p>∮_C P dx + Q dy = ∫∫_R (∂Q/∂x - ∂P/∂y) dA</p>

              <h3>Divergence and Curl</h3>
              <ul>
                <li><strong>Divergence:</strong> div F = ∇ · F = ∂P/∂x + ∂Q/∂y + ∂R/∂z</li>
                <li><strong>Curl:</strong> curl F = ∇ × F</li>
              </ul>

              <h3>Stokes' Theorem</h3>
              <p>∮_C F · dr = ∫∫_S (∇ × F) · n dS</p>
              
              <h3>Divergence Theorem</h3>
              <p>∫∫_S F · n dS = ∫∫∫_E ∇ · F dV</p>
            `,
            completed: false
          },
          {
            title: 'Module 5: Differential Equations',
            description: 'First and second order ODEs, systems, and applications',
            duration: '4 hours',
            videoUrl: '/videos/module5.mp4',
            content: `
              <h2>Differential Equations</h2>
              
              <h3>First Order ODEs</h3>
              <p>General form: dy/dx = f(x,y)</p>
              
              <h4>Types:</h4>
              <ul>
                <li><strong>Separable:</strong> dy/dx = g(x)h(y)</li>
                <li><strong>Linear:</strong> dy/dx + P(x)y = Q(x)</li>
                <li><strong>Exact:</strong> M(x,y)dx + N(x,y)dy = 0</li>
              </ul>

              <h3>Example: Population Growth</h3>
              <p>dP/dt = kP (exponential growth)</p>
              <p>Solution: P(t) = P₀e^(kt)</p>

              <h3>Second Order ODEs</h3>
              <p>ay'' + by' + cy = f(x)</p>
              
              <h4>Homogeneous Solution:</h4>
              <p>Characteristic equation: ar² + br + c = 0</p>
              <ul>
                <li>Real distinct roots: y = c₁e^(r₁x) + c₂e^(r₂x)</li>
                <li>Repeated root: y = (c₁ + c₂x)e^(rx)</li>
                <li>Complex roots: y = e^(αx)(c₁cos(βx) + c₂sin(βx))</li>
              </ul>

              <h3>Applications:</h3>
              <ul>
                <li>Spring-mass systems</li>
                <li>RLC circuits</li>
                <li>Population dynamics</li>
                <li>Heat transfer</li>
              </ul>

              <h3>Systems of ODEs</h3>
              <p>dx/dt = ax + by</p>
              <p>dy/dt = cx + dy</p>
              <p>Solution using eigenvalues and eigenvectors</p>
            `,
            completed: false
          }
        ],
        thumbnail: '',
        isFeatured: true,
        enrolledCount: 1250,
        rating: 4.9,
        createdAt: new Date()
      },
      {
        _id: '2',
        title: 'Linear Algebra & Matrix Theory',
        description: 'Comprehensive course on vector spaces, linear transformations, eigenvalues, and applications',
        category: 'Algebra',
        difficulty: 'Advanced',
        price: 89.99,
        instructor: 'Prof. Michael Chen, MIT',
        duration: '14 weeks',
        topics: ['Vector Spaces', 'Linear Transformations', 'Eigenvalues', 'Matrix Decomposition', 'Applications'],
        content: [
          {
            title: 'Module 1: Vector Spaces',
            description: 'Foundation of linear algebra - vector spaces and subspaces',
            duration: '2 hours',
            content: `
              <h2>Vector Spaces</h2>
              <p>A vector space V over field F is a set with two operations: addition and scalar multiplication.</p>
              
              <h3>Axioms:</h3>
              <ol>
                <li>Closure under addition: u + v ∈ V</li>
                <li>Commutativity: u + v = v + u</li>
                <li>Associativity: (u + v) + w = u + (v + w)</li>
                <li>Zero vector: ∃ 0 such that v + 0 = v</li>
                <li>Additive inverse: ∃ -v such that v + (-v) = 0</li>
                <li>Scalar multiplication closure: αv ∈ V</li>
                <li>Distributivity: α(u + v) = αu + αv</li>
                <li>Identity: 1v = v</li>
              </ol>

              <h3>Examples:</h3>
              <ul>
                <li>ℝⁿ: n-dimensional real vectors</li>
                <li>Polynomials P_n of degree ≤ n</li>
                <li>Matrices M_{m×n}</li>
                <li>Functions C[a,b]</li>
              </ul>

              <h3>Subspaces</h3>
              <p>A subset W ⊆ V is a subspace if:</p>
              <ul>
                <li>0 ∈ W</li>
                <li>Closed under addition</li>
                <li>Closed under scalar multiplication</li>
              </ul>
            `,
            completed: false
          },
          {
            title: 'Module 2: Linear Independence & Basis',
            description: 'Understanding basis, dimension, and coordinate systems',
            duration: '2.5 hours',
            content: `
              <h2>Linear Independence</h2>
              <p>Vectors v₁, v₂, ..., vₙ are linearly independent if:</p>
              <p>c₁v₁ + c₂v₂ + ... + cₙvₙ = 0 implies c₁ = c₂ = ... = cₙ = 0</p>

              <h3>Basis</h3>
              <p>A basis for V is a linearly independent spanning set.</p>
              <p>Every vector v ∈ V can be uniquely written as:</p>
              <p>v = c₁v₁ + c₂v₂ + ... + cₙvₙ</p>

              <h3>Dimension</h3>
              <p>dim(V) = number of vectors in any basis</p>
              
              <h3>Example: ℝ³</h3>
              <p>Standard basis: {(1,0,0), (0,1,0), (0,0,1)}</p>
              <p>dim(ℝ³) = 3</p>

              <h3>Gram-Schmidt Process</h3>
              <p>Convert any basis to orthonormal basis:</p>
              <ol>
                <li>u₁ = v₁/||v₁||</li>
                <li>u₂ = (v₂ - (v₂·u₁)u₁)/||v₂ - (v₂·u₁)u₁||</li>
                <li>Continue for all vectors</li>
              </ol>
            `,
            completed: false
          },
          {
            title: 'Module 3: Linear Transformations',
            description: 'Matrix representations and properties of linear maps',
            duration: '3 hours',
            content: `
              <h2>Linear Transformations</h2>
              <p>T: V → W is linear if:</p>
              <ul>
                <li>T(u + v) = T(u) + T(v)</li>
                <li>T(αv) = αT(v)</li>
              </ul>

              <h3>Matrix Representation</h3>
              <p>Every linear transformation can be represented by a matrix.</p>
              <p>If T: ℝⁿ → ℝᵐ, then T(x) = Ax for some m×n matrix A</p>

              <h3>Key Concepts:</h3>
              <ul>
                <li><strong>Kernel:</strong> ker(T) = {v : T(v) = 0}</li>
                <li><strong>Image:</strong> im(T) = {T(v) : v ∈ V}</li>
                <li><strong>Rank:</strong> dim(im(T))</li>
                <li><strong>Nullity:</strong> dim(ker(T))</li>
              </ul>

              <h3>Rank-Nullity Theorem</h3>
              <p>dim(V) = rank(T) + nullity(T)</p>

              <h3>Examples:</h3>
              <ul>
                <li>Rotation in ℝ²</li>
                <li>Projection onto subspace</li>
                <li>Differentiation operator</li>
              </ul>
            `,
            completed: false
          },
          {
            title: 'Module 4: Eigenvalues & Eigenvectors',
            description: 'Spectral theory and diagonalization',
            duration: '3.5 hours',
            content: `
              <h2>Eigenvalues and Eigenvectors</h2>
              <p>For matrix A, if Av = λv for v ≠ 0, then:</p>
              <ul>
                <li>λ is an eigenvalue</li>
                <li>v is an eigenvector</li>
              </ul>

              <h3>Characteristic Polynomial</h3>
              <p>det(A - λI) = 0</p>
              <p>Roots give eigenvalues</p>

              <h3>Example: 2×2 Matrix</h3>
              <p>A = [[3, 1], [1, 3]]</p>
              <p>det(A - λI) = (3-λ)² - 1 = λ² - 6λ + 8 = 0</p>
              <p>λ₁ = 4, λ₂ = 2</p>

              <h3>Diagonalization</h3>
              <p>A = PDP⁻¹ where:</p>
              <ul>
                <li>D is diagonal matrix of eigenvalues</li>
                <li>P is matrix of eigenvectors</li>
              </ul>

              <h3>Applications:</h3>
              <ul>
                <li>Solving differential equations</li>
                <li>Principal Component Analysis (PCA)</li>
                <li>Google PageRank algorithm</li>
                <li>Quantum mechanics</li>
              </ul>

              <h3>Spectral Theorem</h3>
              <p>Symmetric matrices are orthogonally diagonalizable</p>
            `,
            completed: false
          }
        ],
        thumbnail: '',
        isFeatured: true,
        enrolledCount: 890,
        rating: 4.9,
        createdAt: new Date()
      },
      {
        _id: '3',
        title: 'Abstract Algebra & Group Theory',
        description: 'Explore algebraic structures: groups, rings, fields, and their applications',
        category: 'Algebra',
        difficulty: 'Advanced',
        price: 94.99,
        instructor: 'Dr. Emily Rodriguez, PhD',
        duration: '15 weeks',
        topics: ['Groups', 'Rings', 'Fields', 'Galois Theory', 'Homomorphisms'],
        content: [
          {
            title: 'Module 1: Introduction to Groups',
            description: 'Fundamental concepts of group theory',
            duration: '2.5 hours',
            content: `
              <h2>Group Theory</h2>
              <p>A group (G, ∗) is a set G with binary operation ∗ satisfying:</p>
              
              <h3>Group Axioms:</h3>
              <ol>
                <li><strong>Closure:</strong> a ∗ b ∈ G for all a, b ∈ G</li>
                <li><strong>Associativity:</strong> (a ∗ b) ∗ c = a ∗ (b ∗ c)</li>
                <li><strong>Identity:</strong> ∃ e such that e ∗ a = a ∗ e = a</li>
                <li><strong>Inverse:</strong> ∀ a ∃ a⁻¹ such that a ∗ a⁻¹ = a⁻¹ ∗ a = e</li>
              </ol>

              <h3>Examples:</h3>
              <ul>
                <li>(ℤ, +): integers under addition</li>
                <li>(ℝ*, ×): non-zero reals under multiplication</li>
                <li>Symmetric group Sₙ: permutations</li>
                <li>Matrix groups: GL(n), SL(n), O(n)</li>
              </ul>

              <h3>Abelian Groups</h3>
              <p>A group is abelian if a ∗ b = b ∗ a for all a, b</p>

              <h3>Order of Elements</h3>
              <p>Order of a is smallest n such that aⁿ = e</p>
              <p>Lagrange's Theorem: |H| divides |G| for subgroup H</p>
            `,
            completed: false
          },
          {
            title: 'Module 2: Subgroups & Cosets',
            description: 'Structure within groups',
            duration: '2 hours',
            content: `
              <h2>Subgroups</h2>
              <p>H ⊆ G is a subgroup if H is itself a group under same operation</p>
              
              <h3>Subgroup Test:</h3>
              <ul>
                <li>e ∈ H</li>
                <li>a, b ∈ H ⟹ ab ∈ H</li>
                <li>a ∈ H ⟹ a⁻¹ ∈ H</li>
              </ul>

              <h3>Cosets</h3>
              <p>Left coset: aH = {ah : h ∈ H}</p>
              <p>Right coset: Ha = {ha : h ∈ H}</p>

              <h3>Normal Subgroups</h3>
              <p>H is normal if gHg⁻¹ = H for all g ∈ G</p>
              <p>Notation: H ⊴ G</p>

              <h3>Quotient Groups</h3>
              <p>If H ⊴ G, then G/H is a group</p>
              <p>Elements: cosets aH</p>
              <p>Operation: (aH)(bH) = (ab)H</p>
            `,
            completed: false
          }
        ],
        thumbnail: '',
        isFeatured: false,
        enrolledCount: 420,
        rating: 4.8,
        createdAt: new Date()
      },
      {
        _id: '4',
        title: 'Real Analysis & Topology',
        description: 'Rigorous foundations of calculus, metric spaces, and topological concepts',
        category: 'Analysis',
        difficulty: 'Advanced',
        price: 99.99,
        instructor: 'Prof. James Wilson, Oxford',
        duration: '16 weeks',
        topics: ['Sequences', 'Series', 'Continuity', 'Metric Spaces', 'Compactness', 'Connectedness'],
        content: [
          {
            title: 'Module 1: Sequences and Limits',
            description: 'Rigorous treatment of convergence',
            duration: '3 hours',
            content: `
              <h2>Sequences and Convergence</h2>
              
              <h3>Definition of Limit</h3>
              <p>A sequence (aₙ) converges to L if:</p>
              <p>∀ ε > 0, ∃ N such that n > N ⟹ |aₙ - L| < ε</p>

              <h3>Properties:</h3>
              <ul>
                <li>Uniqueness of limits</li>
                <li>Bounded sequences</li>
                <li>Monotone convergence theorem</li>
                <li>Cauchy sequences</li>
              </ul>

              <h3>Bolzano-Weierstrass Theorem</h3>
              <p>Every bounded sequence has a convergent subsequence</p>

              <h3>Series</h3>
              <p>∑aₙ converges if sequence of partial sums converges</p>
              
              <h4>Tests for Convergence:</h4>
              <ul>
                <li>Comparison test</li>
                <li>Ratio test</li>
                <li>Root test</li>
                <li>Integral test</li>
              </ul>
            `,
            completed: false
          },
          {
            title: 'Module 2: Continuity and Uniform Continuity',
            description: 'Deep understanding of continuous functions',
            duration: '2.5 hours',
            content: `
              <h2>Continuity</h2>
              
              <h3>ε-δ Definition</h3>
              <p>f is continuous at a if:</p>
              <p>∀ ε > 0, ∃ δ > 0 such that |x - a| < δ ⟹ |f(x) - f(a)| < ε</p>

              <h3>Uniform Continuity</h3>
              <p>f is uniformly continuous if δ works for all points</p>

              <h3>Important Theorems:</h3>
              <ul>
                <li><strong>Intermediate Value Theorem:</strong> Continuous function takes all intermediate values</li>
                <li><strong>Extreme Value Theorem:</strong> Continuous function on compact set attains max and min</li>
                <li><strong>Heine-Cantor:</strong> Continuous on compact ⟹ uniformly continuous</li>
              </ul>
            `,
            completed: false
          }
        ],
        thumbnail: '',
        isFeatured: true,
        enrolledCount: 340,
        rating: 4.9,
        createdAt: new Date()
      },
    ]
  }
  
  await db.write()
  return db
}

module.exports = { db, initDB }
