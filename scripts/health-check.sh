#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_HEALTHY=true

echo "🏥 Cortex Services Health Check"
echo ""

# Check Redis
echo -n "📦 Redis:      "
if docker exec cortex-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
    ALL_HEALTHY=false
fi

# Check PostgreSQL
echo -n "🐘 PostgreSQL: "
if docker exec cortex-postgres pg_isready -U cortex 2>/dev/null | grep -q "accepting connections"; then
    echo -e "${GREEN}✅ Healthy${NC}"
    
    # Check pgvector extension
    echo -n "   - pgvector: "
    if docker exec cortex-postgres psql -U cortex -d cortex -tAc "SELECT 1 FROM pg_extension WHERE extname = 'vector';" 2>/dev/null | grep -q "1"; then
        echo -e "${GREEN}✅ Installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Not installed (will be created on first use)${NC}"
    fi
else
    echo -e "${RED}❌ Unhealthy${NC}"
    ALL_HEALTHY=false
fi

# Check Weaviate
echo -n "🔍 Weaviate:   "
if curl -s http://localhost:8080/v1/.well-known/ready 2>/dev/null | grep -q "true"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
    ALL_HEALTHY=false
fi

echo ""

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All services are healthy${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Some services are unhealthy${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Run 'docker-compose logs' to see what's wrong"
    exit 1
fi
