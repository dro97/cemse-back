@echo off
setlocal enabledelayedexpansion

echo 🐳 Full Express API - Docker Setup
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo 📖 Visit: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo 📖 Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "ssl" mkdir ssl

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # Database
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/full_express_api"
        echo.
        echo # Application
        echo NODE_ENV=development
        echo PORT=3001
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo.
        echo # Redis
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo.
        echo # Rate limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
    ) > .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

REM Check command line arguments
if "%1"=="dev" (
    call :start_services "dev"
) else if "%1"=="prod" (
    call :start_services "prod"
) else (
    echo ❌ Invalid option: %1
    echo.
    echo Usage: %0 [dev^|prod]
    echo.
    echo Options:
    echo   dev   - Start development environment with hot reloading
    echo   prod  - Start production environment
    echo.
    echo Examples:
    echo   %0 dev   # Start development environment
    echo   %0 prod  # Start production environment
    pause
    exit /b 1
)

echo.
echo 📖 For more information, see DOCKER.md
echo 🐛 For troubleshooting, run: docker-compose logs
pause
exit /b 0

:start_services
set env=%1
set compose_file=docker-compose.yml

if "%env%"=="dev" (
    set compose_file=docker-compose.dev.yml
)

echo 🚀 Starting %env% environment...
docker-compose -f %compose_file% up --build -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...
docker-compose -f %compose_file% ps

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Service URLs:
echo   - API: http://localhost:3001
echo   - Swagger Docs: http://localhost:3001/api-docs
echo   - Health Check: http://localhost:3001/health

if "%env%"=="dev" (
    echo   - Prisma Studio: http://localhost:5555
    echo   - Adminer (DB): http://localhost:8080
    echo   - MailHog: http://localhost:8025
)

echo.
echo 🔧 Useful commands:
echo   - View logs: docker-compose -f %compose_file% logs -f
echo   - Stop services: docker-compose -f %compose_file% down
echo   - Restart: docker-compose -f %compose_file% restart
goto :eof 