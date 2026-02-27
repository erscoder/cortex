#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Cortex Development Environment Setup${NC}"
echo ""

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed and running${NC}"

# Check docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose not found, using 'docker compose' instead${NC}"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Stop any existing containers
echo ""
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$COMPOSE_CMD down 2>/dev/null || true

# Start services
echo ""
echo -e "${GREEN}🔄 Starting services (Redis, PostgreSQL, Weaviate)...${NC}"
$COMPOSE_CMD up -d

# Wait for health checks
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Function to wait for service
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker inspect --format='{{.State.Health.Status}}' cortex-$service 2>/dev/null | grep -q "healthy"; then
            echo -e "${GREEN}  ✅ $service is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}  ⏳ Waiting for $service... (attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}  ❌ $service failed to start${NC}"
    return 1
}

# Wait for each service
wait_for_service "redis" || exit 1
wait_for_service "postgres" || exit 1
wait_for_service "weaviate" || exit 1

# Run health check script
echo ""
echo -e "${GREEN}🏥 Running health checks...${NC}"
bash scripts/health-check.sh || exit 1

# Install node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Run migrations (if they exist)
if [ -d "migrations" ] && [ "$(ls -A migrations/*.sql 2>/dev/null)" ]; then
    echo ""
    echo -e "${GREEN}🔄 Running database migrations...${NC}"
    # This will be executed automatically by postgres init scripts
    echo -e "${GREEN}  ✅ Migrations loaded${NC}"
fi

# Print success message
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Development environment ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Services running:${NC}"
echo -e "  📦 Redis:      localhost:6379"
echo -e "  🐘 PostgreSQL: localhost:5432 (user: cortex, db: cortex)"
echo -e "  🔍 Weaviate:   http://localhost:8080"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:    ${GREEN}docker-compose logs -f${NC}"
echo -e "  Stop:         ${GREEN}docker-compose down${NC}"
echo -e "  Restart:      ${GREEN}docker-compose restart${NC}"
echo -e "  Health check: ${GREEN}bash scripts/health-check.sh${NC}"
echo ""
echo -e "${GREEN}Ready to code! 🚀${NC}"
