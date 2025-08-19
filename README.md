# Full Express API

A comprehensive Express API with Prisma ORM, featuring real-time communication via Socket.IO and robust role-based access control.

## Features

- **RESTful API** with comprehensive CRUD operations
- **Real-time updates** via Socket.IO
- **JWT Authentication** with role-based access control
- **Role-based Authorization** with 9 distinct user roles
- **Swagger Documentation** at `/api-docs`
- **PostgreSQL Database** with Prisma ORM
- **Docker & Docker Compose** support
- **Comprehensive Testing** with Jest and Supertest
- **Rate Limiting** and security middleware

## Role-Based Access Control

The API implements a comprehensive role-based access control system with 9 distinct user roles:

### User Roles

1. **JOVENES** - Young people (students)
2. **ADOLESCENTES** - Adolescents (students)
3. **EMPRESAS** - Companies (organizations)
4. **GOBIERNOS_MUNICIPALES** - Municipal governments (organizations)
5. **CENTROS_DE_FORMACION** - Training centers (organizations)
6. **ONGS_Y_FUNDACIONES** - NGOs and foundations (organizations)
7. **CLIENT** - General clients
8. **AGENT** - Service agents
9. **SUPER_ADMIN** - System administrator

### Access Permissions

| Resource | JOVENES/ADOLESCENTES | Organizations | CLIENT/AGENT | SUPER_ADMIN |
|----------|---------------------|---------------|--------------|-------------|
| View Courses | ✅ | ✅ | ✅ | ✅ |
| Create Courses | ❌ | ✅ | ❌ | ✅ |
| Delete Courses | ❌ | ❌ | ❌ | ✅ |
| View Lessons | ✅ | ✅ | ✅ | ✅ |
| Create Lessons | ❌ | ✅ | ❌ | ✅ |
| View Quizzes | ✅ | ✅ | ✅ | ✅ |
| Create Quizzes | ❌ | ✅ | ❌ | ✅ |
| View Job Offers | ✅ | ✅ | ✅ | ✅ |
| Create Job Offers | ❌ | ✅ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

### Middleware

The API includes comprehensive middleware for authentication and authorization:

- **`authenticateToken`** - Validates JWT tokens
- **`requireRole(roles)`** - Checks user roles
- **`requireOwnership(model, idParam)`** - Verifies resource ownership
- **`rateLimit(maxRequests, windowMs)`** - Implements rate limiting
- **`requestLogger`** - Logs all requests
- **`errorHandler`** - Centralized error handling

## Authentication

### JWT Token System

- **Access Tokens**: 15-minute expiry
- **Refresh Tokens**: 7-day expiry with automatic rotation
- **Secure Storage**: Tokens stored in database with revocation support

### Authentication Endpoints

```bash
# Register new user
POST /api/auth/register
{
  "username": "user123",
  "password": "password123",
  "role": "JOVENES"
}

# Login
POST /api/auth/login
{
  "username": "user123",
  "password": "password123"
}

# Refresh token
POST /api/auth/refresh
{
  "refreshToken": "refresh-token-here"
}

# Logout
POST /api/auth/logout
{
  "refreshToken": "refresh-token-here"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>

# Check role access
GET /api/auth/check-role/JOVENES
Authorization: Bearer <token>
```

## Real-time Communication

The API includes Socket.IO for real-time updates. When data changes (create, update, delete), events are automatically emitted to all connected clients.

### Socket.IO Events

- `profile:created` - When a new profile is created
- `profile:updated` - When a profile is updated  
- `profile:deleted` - When a profile is deleted
- `course:created` - When a new course is created
- `course:updated` - When a course is updated
- `course:deleted` - When a course is deleted
- `lesson:created` - When a new lesson is created
- `lesson:updated` - When a lesson is updated
- `lesson:deleted` - When a lesson is deleted
- `quiz:created` - When a new quiz is created
- `quiz:updated` - When a quiz is updated
- `quiz:deleted` - When a quiz is deleted

### Connecting to Socket.IO

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Listen for real-time updates
socket.on('profile:created', (data) => {
  console.log('New profile created:', data);
});

socket.on('course:updated', (data) => {
  console.log('Course updated:', data);
});

// Join role-based rooms
socket.emit('join-room', 'JOVENES');
```

### Socket.IO API Endpoints

- `GET /api/socket/status` - Get server status and active connections
- `POST /api/socket/emit` - Emit custom events to all clients

## API Endpoints

### Protected Routes

All API endpoints require authentication unless specified otherwise. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

- **Profiles**: `/api/profiles` (CRUD)
- **Courses**: `/api/courses` (CRUD)
- **Lessons**: `/api/lessons` (CRUD)
- **Quizzes**: `/api/quizzes` (CRUD)
- **Job Offers**: `/api/job-offers` (CRUD)
- **Course Modules**: `/api/course-modules` (CRUD)
- **Course Enrollments**: `/api/course-enrollments` (CRUD)
- **Lesson Progress**: `/api/lesson-progress` (CRUD)
- **Quiz Attempts**: `/api/quiz-attempts` (CRUD)
- **Quiz Questions**: `/api/quiz-questions` (CRUD)
- **Quiz Answers**: `/api/quiz-answers` (CRUD)
- **Certificates**: `/api/certificates` (CRUD)
- **Student Notes**: `/api/student-notes` (CRUD)
- **Discussions**: `/api/discussions` (CRUD)
- **Entrepreneurship**: `/api/entrepreneurship` (CRUD)
- **Business Plans**: `/api/business-plans` (CRUD)
- **News Articles**: `/api/news-articles` (CRUD)
- **News Comments**: `/api/news-comments` (CRUD)
- **Job Applications**: `/api/job-applications` (CRUD)
- **Job Questions**: `/api/job-questions` (CRUD)
- **Job Question Answers**: `/api/job-question-answers` (CRUD)

## Testing

The API includes comprehensive automated testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run authentication tests only
npm run test:auth

# Run role-based access control tests
npm run test:rbac

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Authentication Tests**: JWT token validation, login/logout, refresh tokens
- **Role-Based Access Tests**: All 9 roles, permission matrix validation
- **CRUD Tests**: All endpoints with proper authorization
- **Error Handling Tests**: Invalid requests, unauthorized access
- **Rate Limiting Tests**: Request throttling validation

## 🐳 Docker & Docker Compose

### Quick Start

#### Development Environment
```bash
# Start with hot reloading and development tools
npm run docker:dev

# Access services:
# - API: http://localhost:3001
# - Prisma Studio: http://localhost:5555
# - Adminer (DB): http://localhost:8080
# - MailHog: http://localhost:8025
```

#### Production Environment
```bash
# Start production environment
npm run docker:prod

# Start with Nginx reverse proxy
docker-compose --profile production up --build
```

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **API** | 3001 | Express API with Prisma |
| **Database** | 5432 | PostgreSQL 15 |
| **Redis** | 6379 | Cache layer |
| **Prisma Studio** | 5555 | Database GUI (dev) |
| **Adminer** | 8080 | Database management (dev) |
| **MailHog** | 8025 | Email testing (dev) |
| **Nginx** | 80/443 | Reverse proxy (prod) |

### Docker Commands

```bash
# Development
npm run docker:dev          # Start development environment
npm run docker:studio       # Open Prisma Studio
npm run docker:shell        # Access API container shell
npm run docker:db           # Access database

# Production
npm run docker:prod         # Start production environment
npm run docker:logs         # View logs
npm run docker:down         # Stop all services
npm run docker:clean        # Clean up volumes
```

### Database Management

```bash
# Run migrations
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npm run prisma:seed

# Backup database
docker-compose exec db pg_dump -U postgres full_express_api > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres -d full_express_api < backup.sql
```

📖 **For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md)**

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd full-express-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database URL
```

4. **Generate Prisma client**
```bash
npm run prisma:generate
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed the database**
```bash
npm run prisma:seed
```

7. **Start development server**
```bash
npm run dev
```

### Database Seeding

The seed script creates:
- Super admin user (`admin` / `admin123`)
- Sample users for each role
- Test data for development

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/full_express_api"
PORT=3001
JWT_SECRET="your-secret-key"
```

## Security Features

- **JWT Authentication** with short-lived access tokens
- **Refresh Token Rotation** for enhanced security
- **Role-Based Access Control** with granular permissions
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Error Handling** without information leakage
- **Request Logging** for audit trails
- **CORS Configuration** for cross-origin requests

## API Documentation

Comprehensive Swagger documentation is available at `/api-docs` when the server is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Role-based access information
- Example requests and responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details. 