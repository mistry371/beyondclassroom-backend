'use client'

import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Calendar, User, Clock, Share2, BookmarkPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BlogDetailPage() {
  const params = useParams()

  const blogData = {
    1: {
      title: 'Understanding Calculus: A Beginner\'s Guide',
      author: 'Dr. Sarah Johnson',
      date: '2024-03-15',
      readTime: '8 min read',
      category: 'Mathematics',
      content: `
        <h2>Introduction to Calculus</h2>
        <p>Calculus is one of the most powerful tools in mathematics, enabling us to understand change and motion. Whether you're studying physics, engineering, economics, or computer science, calculus provides the foundation for analyzing dynamic systems.</p>

        <h2>What is Calculus?</h2>
        <p>Calculus is divided into two main branches:</p>
        <ul>
          <li><strong>Differential Calculus</strong> - Deals with rates of change and slopes of curves</li>
          <li><strong>Integral Calculus</strong> - Deals with accumulation of quantities and areas under curves</li>
        </ul>

        <h2>Key Concepts in Differential Calculus</h2>
        <p>The derivative is the fundamental concept in differential calculus. It represents the instantaneous rate of change of a function. For example, if you're driving a car, your speedometer shows your instantaneous velocity - this is a derivative!</p>

        <h3>The Derivative Formula</h3>
        <p>The derivative of a function f(x) is defined as:</p>
        <p><code>f'(x) = lim(h→0) [f(x+h) - f(x)] / h</code></p>

        <h2>Key Concepts in Integral Calculus</h2>
        <p>Integration is the reverse process of differentiation. While derivatives measure rates of change, integrals measure accumulation. Think of it as finding the total distance traveled when you know the velocity at each moment.</p>

        <h3>The Fundamental Theorem of Calculus</h3>
        <p>This theorem connects differentiation and integration, showing they are inverse operations. It's one of the most important results in mathematics!</p>

        <h2>Real-World Applications</h2>
        <ul>
          <li><strong>Physics</strong> - Calculating velocity, acceleration, and trajectories</li>
          <li><strong>Engineering</strong> - Optimizing designs and analyzing structures</li>
          <li><strong>Economics</strong> - Marginal cost and revenue analysis</li>
          <li><strong>Medicine</strong> - Modeling drug concentration in bloodstream</li>
          <li><strong>Computer Graphics</strong> - Creating smooth curves and animations</li>
        </ul>

        <h2>Getting Started with Calculus</h2>
        <p>To master calculus, you need a strong foundation in:</p>
        <ol>
          <li>Algebra - Manipulating equations and expressions</li>
          <li>Functions - Understanding different types of functions</li>
          <li>Trigonometry - Working with sine, cosine, and other trig functions</li>
          <li>Limits - The foundation of calculus</li>
        </ol>

        <h2>Practice Problems</h2>
        <p>The key to learning calculus is practice. Start with simple derivatives like polynomials, then move to more complex functions. Use online resources, textbooks, and our interactive tools to practice regularly.</p>

        <h2>Conclusion</h2>
        <p>Calculus may seem intimidating at first, but with consistent practice and the right approach, anyone can master it. Remember, even Newton and Leibniz had to start somewhere! Take it one concept at a time, and you'll be amazed at how much you can learn.</p>
      `
    },
    2: {
      title: 'Linear Algebra in Machine Learning',
      author: 'Prof. Michael Chen',
      date: '2024-03-12',
      readTime: '10 min read',
      category: 'Mathematics',
      content: `
        <h2>Why Linear Algebra Matters in AI</h2>
        <p>Linear algebra is the backbone of modern machine learning and artificial intelligence. Every neural network, every data transformation, and every optimization algorithm relies heavily on linear algebra concepts.</p>

        <h2>Vectors and Matrices</h2>
        <p>In machine learning, data is represented as vectors and matrices:</p>
        <ul>
          <li><strong>Vectors</strong> - Represent individual data points or features</li>
          <li><strong>Matrices</strong> - Represent datasets, transformations, and neural network weights</li>
        </ul>

        <h2>Key Operations</h2>
        <h3>Matrix Multiplication</h3>
        <p>Matrix multiplication is used everywhere in ML - from forward propagation in neural networks to data transformations. Understanding how matrices multiply is crucial for understanding how neural networks process information.</p>

        <h3>Eigenvalues and Eigenvectors</h3>
        <p>These concepts are fundamental to:</p>
        <ul>
          <li>Principal Component Analysis (PCA)</li>
          <li>Understanding neural network behavior</li>
          <li>Dimensionality reduction</li>
          <li>Spectral clustering</li>
        </ul>

        <h2>Applications in Deep Learning</h2>
        <p>Neural networks are essentially chains of matrix multiplications with non-linear activations. Each layer transforms the input using matrix operations:</p>
        <p><code>output = activation(W × input + b)</code></p>

        <h2>Gradient Descent and Optimization</h2>
        <p>Training neural networks involves computing gradients (derivatives) and updating weights. This is pure linear algebra in action! The gradient is a vector pointing in the direction of steepest increase.</p>

        <h2>Practical Example: Image Classification</h2>
        <p>When you feed an image to a neural network:</p>
        <ol>
          <li>Image is converted to a matrix of pixel values</li>
          <li>Matrix multiplications transform the data through layers</li>
          <li>Final layer produces probability vector for each class</li>
        </ol>

        <h2>Tools and Libraries</h2>
        <p>Modern ML frameworks like TensorFlow and PyTorch handle linear algebra operations efficiently using GPUs. Understanding the underlying math helps you:</p>
        <ul>
          <li>Debug models effectively</li>
          <li>Design better architectures</li>
          <li>Optimize performance</li>
          <li>Understand research papers</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Linear algebra isn't just abstract mathematics - it's the language of machine learning. Mastering these concepts will make you a better ML practitioner and help you understand the "magic" behind AI systems.</p>
      `
    },
    3: {
      title: 'The Beauty of Abstract Algebra',
      author: 'Dr. Emily Rodriguez',
      date: '2024-03-10',
      readTime: '12 min read',
      category: 'Mathematics',
      content: `
        <h2>Introduction to Abstract Algebra</h2>
        <p>Abstract algebra is the study of algebraic structures such as groups, rings, and fields. While it may seem abstract (hence the name!), these concepts have profound applications in cryptography, coding theory, and physics.</p>

        <h2>Groups: The Foundation</h2>
        <p>A group is a set with an operation that satisfies four properties:</p>
        <ol>
          <li><strong>Closure</strong> - Operating on two elements gives another element in the set</li>
          <li><strong>Associativity</strong> - (a * b) * c = a * (b * c)</li>
          <li><strong>Identity</strong> - There exists an element e such that a * e = a</li>
          <li><strong>Inverse</strong> - For each element a, there exists a⁻¹ such that a * a⁻¹ = e</li>
        </ol>

        <h2>Examples of Groups</h2>
        <ul>
          <li>Integers under addition (ℤ, +)</li>
          <li>Non-zero real numbers under multiplication (ℝ*, ×)</li>
          <li>Symmetries of geometric shapes</li>
          <li>Permutations of objects</li>
        </ul>

        <h2>Rings and Fields</h2>
        <p>Rings extend groups by adding a second operation (usually multiplication). Fields are rings where every non-zero element has a multiplicative inverse.</p>

        <h3>Real-World Applications</h3>
        <ul>
          <li><strong>Cryptography</strong> - RSA encryption uses group theory</li>
          <li><strong>Error Correction</strong> - Reed-Solomon codes use finite fields</li>
          <li><strong>Physics</strong> - Symmetry groups describe particle physics</li>
          <li><strong>Chemistry</strong> - Molecular symmetry uses group theory</li>
        </ul>

        <h2>The Elegance of Symmetry</h2>
        <p>One of the most beautiful aspects of abstract algebra is how it captures the concept of symmetry. The symmetries of a square form a group called D₄, which has 8 elements representing rotations and reflections.</p>

        <h2>Galois Theory</h2>
        <p>Évariste Galois revolutionized algebra by connecting field theory with group theory. His work showed why there's no general formula for solving polynomial equations of degree 5 or higher - a problem that had puzzled mathematicians for centuries!</p>

        <h2>Modern Applications</h2>
        <p>Abstract algebra isn't just theoretical:</p>
        <ul>
          <li>Blockchain technology uses elliptic curve groups</li>
          <li>Quantum computing relies on group representations</li>
          <li>Computer graphics uses transformation groups</li>
          <li>Network coding uses finite field arithmetic</li>
        </ul>

        <h2>Learning Path</h2>
        <p>To master abstract algebra:</p>
        <ol>
          <li>Start with group theory basics</li>
          <li>Study concrete examples (symmetry groups, permutations)</li>
          <li>Move to rings and fields</li>
          <li>Explore applications in your field of interest</li>
        </ol>

        <h2>Conclusion</h2>
        <p>Abstract algebra reveals the deep structures underlying mathematics. While it requires patience and practice, the insights you gain will transform how you think about mathematics and its applications.</p>
      `
    }
  }

  const blog = blogData[params.id] || blogData[1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-primary hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Blogs
        </Link>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Hero Image */}
          <div className="h-96 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-9xl font-bold">{blog.category.charAt(0)}</span>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Category Badge */}
            <span className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              {blog.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{blog.readTime}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
                <Share2 className="h-5 w-5" />
                Share
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
                <BookmarkPlus className="h-5 w-5" />
                Save
              </button>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{
                color: '#e5e7eb',
              }}
            />

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-primary to-secondary w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {blog.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">About {blog.author}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Expert mathematics educator with years of experience in teaching and research. 
                    Passionate about making complex mathematical concepts accessible to students of all levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((id) => (
              <Link
                key={id}
                href={`/blogs/${id}`}
                className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-primary/50 transition-all"
              >
                <span className="text-primary text-sm font-semibold">Related Article</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-2">
                  {blogData[id]?.title}
                </h3>
                <p className="text-gray-400 text-sm">{blogData[id]?.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles for Prose */}
      <style jsx global>{`
        .prose h2 {
          color: #fff;
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose h3 {
          color: #22d3ee;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .prose ul, .prose ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose strong {
          color: #22d3ee;
          font-weight: 600;
        }
        .prose code {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
