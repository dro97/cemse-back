#!/bin/bash

# Docker Development Scripts for full-express-api

echo "🐳 Docker Development Helper"
echo "=============================="

case "$1" in
    "start")
        echo "🚀 Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "start-bg")
        echo "🚀 Starting development environment in background..."
        docker-compose -f docker-compose.dev.yml up --build -d
        ;;
    "stop")
        echo "🛑 Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    "restart")
        echo "🔄 Restarting development environment..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up --build -d
        ;;
    "logs")
        echo "📋 Showing API logs..."
        docker-compose -f docker-compose.dev.yml logs -f api
        ;;
    "db-only")
        echo "🗄️ Starting only database services..."
        docker-compose -f docker-compose.dev.yml up db minio redis -d
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    "rebuild")
        echo "🔨 Rebuilding API container..."
        docker-compose -f docker-compose.dev.yml build --no-cache api
        docker-compose -f docker-compose.dev.yml up api -d
        ;;
    "shell")
        echo "🐚 Opening shell in API container..."
        docker-compose -f docker-compose.dev.yml exec api sh
        ;;
    "prisma-studio")
        echo "📊 Opening Prisma Studio..."
        echo "Go to: http://localhost:5555"
        docker-compose -f docker-compose.dev.yml up prisma-studio -d
        ;;
    "status")
        echo "📊 Docker services status:"
        docker-compose -f docker-compose.dev.yml ps
        ;;
    *)
        echo "Usage: $0 {start|start-bg|stop|restart|logs|db-only|clean|rebuild|shell|prisma-studio|status}"
        echo ""
        echo "Commands:"
        echo "  start        - Start all development services"
        echo "  start-bg     - Start all services in background"
        echo "  stop         - Stop all services"
        echo "  restart      - Restart all services"
        echo "  logs         - Show API logs"
        echo "  db-only      - Start only database services"
        echo "  clean        - Clean up Docker resources"
        echo "  rebuild      - Rebuild API container"
        echo "  shell        - Open shell in API container"
        echo "  prisma-studio - Start Prisma Studio"
        echo "  status       - Show services status"
        ;;
esac
