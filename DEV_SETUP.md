# Cortex Development Setup

## Quick Start (One Command)

```bash
npm run setup
```

This will:
- ✅ Check Docker is installed and running
- ✅ Start Redis, PostgreSQL (with pgvector), and Weaviate
- ✅ Wait for all services to be healthy
- ✅ Run database migrations
- ✅ Install npm dependencies
- ✅ Display service URLs

## Manual Setup

### 1. Prerequisites

- **Docker Desktop** installed and running
- **Node.js** 20+ installed
- **npm** or **pnpm**

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Health

```bash
npm run health
```

Expected output:
```
🏥 Cortex Services Health Check

📦 Redis:      ✅ Healthy
🐘 PostgreSQL: ✅ Healthy
   - pgvector: ✅ Installed
🔍 Weaviate:   ✅ Healthy

✅ All services are healthy
```

### 5. Run Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Integration tests (requires services running)
npm run test:integration
```

## Service URLs

| Service    | URL                      | Credentials          |
|------------|--------------------------|----------------------|
| Redis      | `localhost:6379`         | No auth              |
| PostgreSQL | `localhost:5432`         | user: `cortex`, password: `cortex_dev_password` |
| Weaviate   | `http://localhost:8080`  | Anonymous access     |

## Environment Variables

Create `.env.local` for local overrides:

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=cortex
POSTGRES_PASSWORD=cortex_dev_password
POSTGRES_DB=cortex

# Weaviate
WEAVIATE_URL=http://localhost:8080

# LLMs (get from OpenClaw config or .env)
ANTHROPIC_API_KEY=your_key_here
MINIMAX_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run typecheck        # Type check without building
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues

# Testing
npm test                 # Run all tests
npm run test:coverage    # Tests with coverage report
npm run test:integration # Integration tests only

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose restart   # Restart all services
npm run health           # Check service health
```

## Coverage Requirements

**All code must have ≥90% test coverage.**

Coverage is enforced:
- ✅ Locally: `npm run test:coverage` will fail if < 90%
- ✅ CI: GitHub Actions will fail PRs if < 90%
- ✅ Pre-commit: Hooks will warn if coverage drops

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker info

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Nuclear option: full reset
docker-compose down -v
npm run setup
```

### Tests fail with connection errors

```bash
# Verify services are healthy
npm run health

# Check ports aren't already in use
lsof -i :6379  # Redis
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Weaviate
```

### pgvector not installed

```bash
# Restart postgres (migrations run on startup)
docker-compose restart postgres

# Verify extension
docker exec cortex-postgres psql -U cortex -d cortex -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

## CI/CD

The project uses GitHub Actions for CI:

1. **Build**: TypeScript compilation
2. **Type check**: `tsc --noEmit`
3. **Lint**: ESLint
4. **Tests**: Unit + integration with coverage
5. **Coverage gate**: Fails if < 90%

All PRs must pass CI before merge.

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `npm run test:coverage`
4. Ensure coverage ≥ 90%
5. Commit: Use [Conventional Commits](https://www.conventionalcommits.org/)
6. Push and create PR
7. Wait for CI + Vector's review

## Need Help?

- Check logs: `docker-compose logs -f`
- Run health check: `npm run health`
- Ask in #cortex channel on Discord
