# Contributing to Cortex

Thank you for your interest in contributing to Cortex!

## 🚀 Pre-Push Validation

**IMPORTANT:** All code must pass local validation **before** pushing to GitHub.

### Automated Validation (Recommended)

A pre-push hook is configured to run automatically. It will:
1. ✅ Build the project
2. ✅ Type-check
3. ✅ Lint (warnings OK, errors blocked)
4. ✅ Run tests
5. ✅ Check coverage ≥90%

**If any check fails, the push is blocked.**

To skip the hook (NOT recommended):
```bash
git push --no-verify
```

### Manual Validation

Run this single command before pushing:
```bash
npm run validate
```

Or run checks individually:
```bash
# 1. Build
npm run build

# 2. Type-check
npm run typecheck

# 3. Lint
npm run lint

# 4. Tests with coverage
npm test -- --testPathIgnorePatterns=integration --coverage
```

## 📏 Code Standards

### Coverage Requirements
- **Minimum:** 90% coverage (statements, branches, functions, lines)
- New code must maintain or improve coverage
- CI will fail if coverage drops below 90%

### TypeScript Rules
- ❌ No `any` types (implicit or explicit)
- ✅ Explicit return types for public functions
- ✅ JSDoc comments for public APIs
- ✅ Strict mode enabled

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Build/tooling changes
- `ci`: CI/CD changes

**Examples:**
```
feat(memory): add Redis short-term memory
fix(agent): handle undefined reasoning result
docs(readme): update installation instructions
test(rag): add coverage for edge cases
```

## 🐛 Bug Reports

When reporting bugs:
1. Check existing issues first
2. Include minimal reproduction steps
3. Provide environment details (Node version, OS)
4. Include error messages/stack traces

## 💡 Feature Requests

For new features:
1. Check if already requested
2. Describe the use case
3. Provide examples if possible
4. Consider implementation complexity

## 🔄 Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Write** tests for your changes
4. **Ensure** all checks pass (`npm run validate`)
5. **Commit** using conventional commits
6. **Push** to your fork
7. **Open** a pull request

### PR Checklist
- [ ] Tests added/updated
- [ ] Coverage ≥90%
- [ ] Documentation updated
- [ ] Conventional commit format
- [ ] All CI checks passing
- [ ] No breaking changes (or documented)

## 📝 Development Workflow

### Setup
```bash
git clone https://github.com/erscoder/cortex.git
cd cortex
npm install
npm run setup  # Starts Docker services
```

### Running Tests
```bash
npm test                    # Unit tests only
npm test -- --coverage      # With coverage report
npm run test:integration    # Integration tests (requires services)
npm test -- --watch         # Watch mode
```

### Debugging
```bash
npm run dev                 # Run example
npm run typecheck           # Check types
npm run lint                # Check linting
```

## 🤝 Code Review

All submissions require review. We review for:
- **Correctness:** Does it work as intended?
- **Tests:** Are edge cases covered?
- **Performance:** Any performance implications?
- **Style:** Follows project conventions?
- **Documentation:** Clear and complete?

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Questions?** Open an issue or reach out to the maintainers.
