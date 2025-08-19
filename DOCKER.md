# Docker Setup Guide

This guide covers Docker setup for both development and production environments.

## 🐳 Quick Start

### Development Environment

```bash
# Start development environment with hot reloading
npm run docker:dev

# Or manually
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment

```bash
# Start production environment
npm run docker:prod

# Or manually
docker-compose up --build
```

## 📁 Docker Files Structure

```
├── Dockerfile              # Production Dockerfile
├── Dockerfile.dev          # Development Dockerfile
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── nginx.conf             # Nginx reverse proxy config
├── init-db.sql           # Database initialization
└── .dockerignore         # Files to exclude from build
```

## 🚀 Services Overview

### Production Services (`docker-compose.yml`)

| Service | Port | Description |
|---------|------|-------------|
| `api` | 3001 | Express API application |
| `db` | 5432 | PostgreSQL database |
| `redis` | 6379 | Redis cache (optional) |
| `nginx` | 80/443 | Reverse proxy (production profile) |
| `prisma-studio` | 5555 | Database GUI (development profile) |

### Development Services (`docker-compose.dev.yml`)

| Service | Port | Description |
|---------|------|-------------|
| `api` | 3001 | Express API with hot reloading |
| `db` | 5432 | PostgreSQL database |
| `redis` | 6379 | Redis cache |
| `prisma-studio` | 5555 | Database GUI |
| `mailhog` | 1025/8025 | Email testing |
| `adminer` | 8080 | Database management |

## 🔧 Environment Variables

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/full_express_api

# Application
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis (optional)
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🛠️ Development Commands

```bash
# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# Access API container shell
npm run docker:shell

# Access database
npm run docker:db

# Open Prisma Studio
npm run docker:studio

# Stop all services
npm run docker:down

# Clean up volumes
npm run docker:clean
```

## 🏭 Production Commands

```bash
# Start production environment
npm run docker:prod

# Start with Nginx reverse proxy
docker-compose --profile production up --build

# View logs
docker-compose logs -f

# Scale API service
docker-compose up --scale api=3

# Update and restart
docker-compose pull && docker-compose up -d
```

## 🔍 Health Checks

All services include health checks:

- **API**: `http://localhost:3001/health`
- **Database**: PostgreSQL connection test
- **Redis**: Redis ping test

## 📊 Monitoring

### Built-in Analytics Endpoints

- `/api/analytics/performance` - Response times and status codes
- `/api/analytics/errors` - Error tracking and analysis
- `/api/analytics/requests` - Request patterns and user roles
- `/api/analytics/memory` - Memory usage monitoring

### Docker Monitoring

```bash
# View service status
docker-compose ps

# View resource usage
docker stats

# View service logs
docker-compose logs -f api
docker-compose logs -f db
```

## 🔐 Security Features

### Docker Security

- Non-root user in containers
- Health checks for all services
- Network isolation with custom networks
- Volume mounts for persistent data

### Application Security

- JWT authentication with secure tokens
- Rate limiting per IP address
- Input validation and sanitization
- CORS configuration
- Security headers via Nginx

## 🗄️ Database Management

### Prisma Commands in Docker

```bash
# Generate Prisma client
docker-compose exec api npx prisma generate

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npm run prisma:seed

# Open Prisma Studio
docker-compose -f docker-compose.dev.yml up prisma-studio
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d full_express_api

# Backup database
docker-compose exec db pg_dump -U postgres full_express_api > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres -d full_express_api < backup.sql
```

## 🌐 Nginx Configuration

The Nginx reverse proxy provides:

- **Load balancing** for multiple API instances
- **Rate limiting** at the proxy level
- **SSL termination** (configure for production)
- **Gzip compression** for better performance
- **Security headers** for enhanced security

### SSL Configuration

For production SSL, uncomment the HTTPS server block in `nginx.conf` and add your certificates to the `ssl/` directory.

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push Docker image
        run: |
          docker build -t your-registry/full-express-api:${{ github.sha }} .
          docker push your-registry/full-express-api:${{ github.sha }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check database logs
   docker-compose logs db
   
   # Restart database
   docker-compose restart db
   ```

2. **API not starting**
   ```bash
   # Check API logs
   docker-compose logs api
   
   # Rebuild API container
   docker-compose build api
   ```

3. **Port conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Use different ports in docker-compose.yml
   ```

4. **Permission issues**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER ./logs ./uploads
   ```

### Debug Commands

```bash
# Inspect container
docker-compose exec api sh

# View container logs
docker-compose logs -f api

# Check container health
docker-compose ps

# View container resources
docker stats
```

## 📈 Performance Optimization

### Production Optimizations

1. **Multi-stage builds** reduce image size
2. **Health checks** ensure service availability
3. **Volume mounts** for persistent data
4. **Network isolation** for security
5. **Resource limits** prevent resource exhaustion

### Scaling

```bash
# Scale API service
docker-compose up --scale api=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --scale api=3
```

## 🔧 Customization

### Adding New Services

1. Add service to `docker-compose.yml`
2. Configure environment variables
3. Add health checks
4. Update network configuration

### Environment-Specific Configs

Create environment-specific compose files:

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/docker)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis) 