#!/bin/bash

# Docker Production Scripts for full-express-api

echo "🏭 Docker Production Helper"
echo "==========================="

case "$1" in
    "start")
        echo "🚀 Starting production environment..."
        docker-compose up --build -d
        ;;
    "start-with-nginx")
        echo "🚀 Starting production with Nginx..."
        docker-compose --profile production up --build -d
        ;;
    "stop")
        echo "🛑 Stopping production environment..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting production environment..."
        docker-compose down
        docker-compose up --build -d
        ;;
    "logs")
        echo "📋 Showing API logs..."
        docker-compose logs -f api
        ;;
    "logs-all")
        echo "📋 Showing all logs..."
        docker-compose logs -f
        ;;
    "update")
        echo "🔄 Updating production deployment..."
        git pull
        docker-compose build --no-cache api
        docker-compose up api -d
        ;;
    "backup-db")
        echo "💾 Creating database backup..."
        mkdir -p backups
        docker-compose exec db pg_dump -U postgres full_express_api > backups/backup_$(date +%Y%m%d_%H%M%S).sql
        echo "✅ Backup created in backups/ directory"
        ;;
    "restore-db")
        if [ -z "$2" ]; then
            echo "❌ Please provide backup file path"
            echo "Usage: $0 restore-db <backup-file>"
            exit 1
        fi
        echo "🔄 Restoring database from $2..."
        docker-compose exec -T db psql -U postgres -d full_express_api < "$2"
        echo "✅ Database restored"
        ;;
    "migrate")
        echo "🔄 Running database migrations..."
        docker-compose exec api npx prisma migrate deploy
        ;;
    "shell")
        echo "🐚 Opening shell in API container..."
        docker-compose exec api sh
        ;;
    "status")
        echo "📊 Production services status:"
        docker-compose ps
        ;;
    "health")
        echo "🏥 Checking services health:"
        docker-compose exec api wget --no-verbose --tries=1 --spider http://localhost:3001/health
        ;;
    "clean")
        echo "🧹 Cleaning up unused Docker resources..."
        docker system prune -f
        docker image prune -f
        ;;
    *)
        echo "Usage: $0 {start|start-with-nginx|stop|restart|logs|logs-all|update|backup-db|restore-db|migrate|shell|status|health|clean}"
        echo ""
        echo "Commands:"
        echo "  start            - Start production services"
        echo "  start-with-nginx - Start with Nginx reverse proxy"
        echo "  stop             - Stop all services"
        echo "  restart          - Restart all services"
        echo "  logs             - Show API logs"
        echo "  logs-all         - Show all services logs"
        echo "  update           - Update deployment from git"
        echo "  backup-db        - Create database backup"
        echo "  restore-db FILE  - Restore database from backup"
        echo "  migrate          - Run database migrations"
        echo "  shell            - Open shell in API container"
        echo "  status           - Show services status"
        echo "  health           - Check services health"
        echo "  clean            - Clean up Docker resources"
        ;;
esac
