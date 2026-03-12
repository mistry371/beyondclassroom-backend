# Contributing to Elite Mathematics Learning Platform

First off, thank you for considering contributing to Elite Mathematics Learning Platform! It's people like you that make this platform better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other platforms**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test thoroughly
5. Commit your changes:
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gmail account for email testing

### Setup Steps

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/elite-math-platform.git
   cd elite-math-platform
   ```

2. Install dependencies:
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. Set up environment variables (see README.md)

4. Start development servers:
   ```bash
   # Backend
   cd server
   node server-simple.js
   
   # Frontend
   cd client
   npm run dev
   ```

## Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow functional programming principles
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Naming
- Components: PascalCase (e.g., `UserProfile.js`)
- Utilities: camelCase (e.g., `apiHelper.js`)
- Pages: kebab-case (e.g., `user-profile.js`)

### Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Examples:
```
Add: User authentication with OTP
Fix: Course enrollment bug in dashboard
Update: Tailwind configuration for new theme
Refactor: Simplify cart logic
Docs: Update API documentation
```

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Use semicolons
- Follow existing code patterns

## Testing

Before submitting a PR:
- Test all affected features manually
- Ensure no console errors
- Test on different screen sizes
- Test in different browsers (Chrome, Firefox, Safari)
- Verify API endpoints work correctly

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update API documentation for new endpoints
- Include inline comments for complex logic

## Project Structure

```
client/
├── app/              # Next.js pages
├── components/       # Reusable components
├── store/           # Redux store
└── utils/           # Utility functions

server/
├── controllers/     # Route handlers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
└── services/       # Business logic
```

## Areas for Contribution

### High Priority
- Payment gateway integration
- Advanced analytics dashboard
- Mobile responsiveness improvements
- Performance optimizations
- Accessibility enhancements

### Medium Priority
- Additional calculator tools
- More course content
- Enhanced admin features
- Email template improvements
- Better error handling

### Low Priority
- UI/UX refinements
- Code refactoring
- Documentation improvements
- Test coverage
- Internationalization

## Questions?

Feel free to open an issue with the "question" label or email mistryjenish1003@gmail.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
