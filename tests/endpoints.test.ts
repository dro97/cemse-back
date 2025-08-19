import request from 'supertest';
import express from 'express';
import { prisma } from '../lib/prisma';
import routes from '../routes';
import { UserRole } from '@prisma/client';

// Mock the socket.io import
jest.mock('../server', () => ({
  io: {
    emit: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api', routes);

// Test data
const testUsers = {
  superAdmin: {
    username: 'superadmin',
    password: 'password123',
    role: UserRole.SUPERADMIN
  },
  organization: {
    username: 'organization',
    password: 'password123',
    role: UserRole.TRAINING_CENTERS
  },
  client: {
    username: 'client',
    password: 'password123',
    role: UserRole.YOUTH
  }
};

let authTokens: { [key: string]: string } = {};

describe('API Endpoints Tests', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.$transaction([
      prisma.refreshToken.deleteMany(),
      prisma.user.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.lesson.deleteMany(),
      prisma.courseModule.deleteMany(),
      prisma.course.deleteMany(),
    ]);

    // Create test data for foreign key relationships
    const testCourse = await prisma.course.create({
      data: {
        title: 'Test Course',
        slug: 'test-course',
        description: 'A test course',
        category: 'TECHNICAL_SKILLS',
        level: 'BEGINNER',
        duration: 60,
        isActive: true
      } as any
    });

    const testModule = await prisma.courseModule.create({
      data: {
        courseId: testCourse.id,
        title: 'Test Module',
        description: 'A test module',
        orderIndex: 1,
        estimatedDuration: 30,
        isLocked: false
      } as any
    });

    const testProfile = await prisma.profile.create({
      data: {
        userId: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: UserRole.YOUTH,
        active: true
      } as any
    });

    // Store test data IDs for use in tests
    (global as any).testData = {
      courseId: testCourse.id,
      moduleId: testModule.id,
      profileId: testProfile.id
    };
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - Register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.client);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    test('POST /api/auth/login - Login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.client.username,
          password: testUsers.client.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      
      authTokens['client'] = response.body.token;
    });

    test('POST /api/auth/refresh - Refresh token', async () => {
      // First get a refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsers.client.username,
          password: testUsers.client.password
        });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: loginResponse.body.refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('POST /api/auth/logout - Logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
    });
  });

  describe('User Endpoints', () => {
    beforeAll(async () => {
      // Create a super admin user for testing
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.superAdmin);
      authTokens['superAdmin'] = response.body.token;
    });

    test('GET /api/user - List users (requires auth)', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${authTokens['superAdmin']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/user/:id - Get user by ID', async () => {
      // First get the list to get a user ID
      const listResponse = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${authTokens['superAdmin']}`);

      if (listResponse.body.length > 0) {
        const userId = listResponse.body[0].id;
        const response = await request(app)
          .get(`/api/user/${userId}`)
          .set('Authorization', `Bearer ${authTokens['superAdmin']}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
      }
    });

    test('POST /api/user - Create user', async () => {
      const newUser = {
        username: 'newuser',
        password: 'password123',
        role: UserRole.YOUTH
      };

      const response = await request(app)
        .post('/api/user')
        .set('Authorization', `Bearer ${authTokens['superAdmin']}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Course Endpoints', () => {
    beforeAll(async () => {
      // Create an organization user for testing
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers.organization);
      authTokens['organization'] = response.body.token;
    });

    test('GET /api/course - List courses', async () => {
      const response = await request(app)
        .get('/api/course')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/course - Create course (organization only)', async () => {
      const newCourse = {
        title: 'Test Course',
        slug: 'test-course',
        description: 'A test course',
        duration: 60,
        level: 'BEGINNER',
        category: 'SOFT_SKILLS',
        isMandatory: false,
        isActive: true,
        price: 0,
        objectives: ['Learn testing'],
        prerequisites: ['Basic knowledge']
      };

      const response = await request(app)
        .post('/api/course')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('GET /api/course/:id - Get course by ID', async () => {
      // First create a course
      const newCourse = {
        title: 'Test Course 2',
        slug: 'test-course-2',
        description: 'Another test course',
        duration: 60,
        level: 'BEGINNER',
        category: 'SOFT_SKILLS',
        isMandatory: false,
        isActive: true,
        price: 0,
        objectives: ['Learn testing'],
        prerequisites: ['Basic knowledge']
      };

      const createResponse = await request(app)
        .post('/api/course')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newCourse);

      const courseId = createResponse.body.id;
      const response = await request(app)
        .get(`/api/course/${courseId}`)
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', courseId);
    });
  });

  describe('Profile Endpoints', () => {
    test('GET /api/profile - Get user profile', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    test('PUT /api/profile - Update user profile', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authTokens['client']}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'John');
    });
  });

  describe('Quiz Endpoints', () => {
    test('GET /api/quiz - List quizzes', async () => {
      const response = await request(app)
        .get('/api/quiz')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/quiz - Create quiz (organization only)', async () => {
      const newQuiz = {
        title: 'Test Quiz',
        description: 'A test quiz',
        timeLimit: 30,
        passingScore: 70,
        isActive: true
      };

      const response = await request(app)
        .post('/api/quiz')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newQuiz);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Lesson Endpoints', () => {
    test('GET /api/lesson - List lessons', async () => {
      const response = await request(app)
        .get('/api/lesson')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/lesson - Create lesson (organization only)', async () => {
      const newLesson = {
        title: 'Test Lesson',
        content: 'Lesson content',
        moduleId: (global as any).testData.moduleId,
        contentType: 'VIDEO',
        duration: 15,
        orderIndex: 1
      };

      const response = await request(app)
        .post('/api/lesson')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newLesson);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Certificate Endpoints', () => {
    test('GET /api/certificate - List certificates', async () => {
      const response = await request(app)
        .get('/api/certificate')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/certificate - Create certificate', async () => {
      const newCertificate = {
        title: 'Test Certificate',
        description: 'A test certificate',
        criteria: 'Complete the course',
        verificationCode: 'CERT123'
      };

      const response = await request(app)
        .post('/api/certificate')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newCertificate);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Job Offer Endpoints', () => {
    test('GET /api/joboffer - List job offers', async () => {
      const response = await request(app)
        .get('/api/joboffer')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/joboffer - Create job offer', async () => {
      const newJobOffer = {
        title: 'Test Job',
        description: 'A test job offer',
        requirements: 'Experience in testing',
        salaryMin: 50000,
        salaryMax: 60000,
        location: 'Remote',
        contractType: 'FULL_TIME',
        workSchedule: 'FULL_TIME',
        workModality: 'REMOTE',
        experienceLevel: 'ENTRY',
        companyId: (global as any).testData.profileId
      };

      const response = await request(app)
        .post('/api/joboffer')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newJobOffer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Discussion Endpoints', () => {
    test('GET /api/discussion - List discussions', async () => {
      const response = await request(app)
        .get('/api/discussion')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/discussion - Create discussion', async () => {
      const newDiscussion = {
        lessonId: (global as any).testData.moduleId, // Using moduleId as lessonId for now
        userId: (global as any).testData.profileId,
        content: 'Discussion content'
      };

      const response = await request(app)
        .post('/api/discussion')
        .set('Authorization', `Bearer ${authTokens['client']}`)
        .send(newDiscussion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('News Article Endpoints', () => {
    test('GET /api/newsarticle - List news articles', async () => {
      const response = await request(app)
        .get('/api/newsarticle')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/newsarticle - Create news article', async () => {
      const newArticle = {
        title: 'Test News',
        content: 'News content',
        summary: 'News summary',
        authorId: (global as any).testData.profileId,
        authorName: 'Test Author',
        authorType: 'ORGANIZATION',
        category: 'Technology'
      };

      const response = await request(app)
        .post('/api/newsarticle')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Resource Endpoints', () => {
    test('GET /api/resource - List resources', async () => {
      const response = await request(app)
        .get('/api/resource')
        .set('Authorization', `Bearer ${authTokens['client']}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/resource - Create resource', async () => {
      const newResource = {
        title: 'Test Resource',
        description: 'Resource description',
        type: 'guide',
        category: 'Education',
        format: 'PDF',
        thumbnail: 'https://example.com/thumbnail.jpg',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/api/resource')
        .set('Authorization', `Bearer ${authTokens['organization']}`)
        .send(newResource);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Error Handling Tests', () => {
    test('GET /api/nonexistent - 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    test('POST /api/auth/login - Invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    test('GET /api/course - Unauthorized access', async () => {
      const response = await request(app)
        .get('/api/course');

      expect(response.status).toBe(401);
    });

    test('POST /api/course - Insufficient permissions', async () => {
      const newCourse = {
        title: 'Test Course',
        slug: 'test-course',
        description: 'A test course',
        duration: 60,
        level: 'BEGINNER',
        category: 'SOFT_SKILLS'
      };

      const response = await request(app)
        .post('/api/course')
        .set('Authorization', `Bearer ${authTokens['client']}`)
        .send(newCourse);

      expect(response.status).toBe(403);
    });
  });
}); 
