#!/bin/bash

# Docker Setup Script for Full Express API
# This script helps you set up the Docker environment quickly

set -e

echo "🐳 Full Express API - Docker Setup"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "📖 Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "📖 Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads ssl

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod 755 logs uploads

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/full_express_api"

# Application
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Function to start services
start_services() {
    local env=$1
    local compose_file="docker-compose.yml"
    
    if [ "$env" = "dev" ]; then
        compose_file="docker-compose.dev.yml"
    fi
    
    echo "🚀 Starting $env environment..."
    docker-compose -f $compose_file up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    echo "🔍 Checking service health..."
    docker-compose -f $compose_file ps
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "📋 Service URLs:"
    echo "  - API: http://localhost:3001"
echo "  - Swagger Docs: http://localhost:3001/api-docs"
echo "  - Health Check: http://localhost:3001/health"
    
    if [ "$env" = "dev" ]; then
        echo "  - Prisma Studio: http://localhost:5555"
        echo "  - Adminer (DB): http://localhost:8080"
        echo "  - MailHog: http://localhost:8025"
    fi
    
    echo ""
    echo "🔧 Useful commands:"
    echo "  - View logs: docker-compose -f $compose_file logs -f"
    echo "  - Stop services: docker-compose -f $compose_file down"
    echo "  - Restart: docker-compose -f $compose_file restart"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [dev|prod]"
    echo ""
    echo "Options:"
    echo "  dev   - Start development environment with hot reloading"
    echo "  prod  - Start production environment"
    echo ""
    echo "Examples:"
    echo "  $0 dev   # Start development environment"
    echo "  $0 prod  # Start production environment"
}

# Main script logic
case "${1:-}" in
    "dev")
        start_services "dev"
        ;;
    "prod")
        start_services "prod"
        ;;
    *)
        echo "❌ Invalid option: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "📖 For more information, see DOCKER.md"
echo "🐛 For troubleshooting, run: docker-compose logs" 