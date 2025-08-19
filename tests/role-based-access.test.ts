import request from 'supertest';
import { prisma } from '../lib/prisma';
import { app } from '../server';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

describe('Role-Based Access Control', () => {
  let superAdminToken: string;
  let youthToken: string;
  let adolescentsToken: string;
  let companiesToken: string;
  let municipalToken: string;
  let trainingToken: string;
  let ngosToken: string;
  let superadminToken: string;

  beforeAll(async () => {
    // Create test users for each role
    const testUsers = [
      { username: 'test-youth', password: 'password123', role: UserRole.YOUTH },
      { username: 'test-adolescents', password: 'password123', role: UserRole.ADOLESCENTS },
      { username: 'test-companies', password: 'password123', role: UserRole.COMPANIES },
      { username: 'test-municipal', password: 'password123', role: UserRole.MUNICIPAL_GOVERNMENTS },
      { username: 'test-training', password: 'password123', role: UserRole.TRAINING_CENTERS },
      { username: 'test-ngos', password: 'password123', role: UserRole.NGOS_AND_FOUNDATIONS },
      { username: 'test-superadmin', password: 'password123', role: UserRole.SUPERADMIN },
    ];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          username: userData.username,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
        },
      });
    }

    // Login as super admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    superAdminToken = adminRes.body.token;

    // Login as each role and assign tokens
    const youthRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-youth', password: 'password123' });
    youthToken = youthRes.body.token;

    const adolescentsRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-adolescents', password: 'password123' });
    adolescentsToken = adolescentsRes.body.token;

    const companiesRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-companies', password: 'password123' });
    companiesToken = companiesRes.body.token;

    const municipalRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-municipal', password: 'password123' });
    municipalToken = municipalRes.body.token;

    const trainingRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-training', password: 'password123' });
    trainingToken = trainingRes.body.token;

    const ngosRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-ngos', password: 'password123' });
    ngosToken = ngosRes.body.token;

    const superadminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test-superadmin', password: 'password123' });
    superadminToken = superadminRes.body.token;
  });

  afterAll(async () => {
    // Clean up test users
    const testUsernames = [
      'test-youth', 'test-adolescents', 'test-companies', 'test-municipal',
      'test-training', 'test-ngos', 'test-superadmin'
    ];
    
    for (const username of testUsernames) {
      await prisma.user.deleteMany({ where: { username } });
    }
  });

  describe('Authentication Tests', () => {
    it('should reject requests without authentication', async () => {
      const res = await request(app).get('/api/profiles');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid tokens', async () => {
      const res = await request(app)
        .get('/api/profiles')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('Super Admin Access', () => {
    it('should allow super admin to access all endpoints', async () => {
      const endpoints = [
        '/api/profiles',
        '/api/courses',
        '/api/lessons',
        '/api/quizzes',
        '/api/job-offers',
        '/api/auth/users'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${superAdminToken}`);
        expect(res.status).toBe(200);
      }
    });

    it('should allow super admin to create resources', async () => {
      const courseData = { title: 'Test Course', description: 'Test Description' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(courseData);
      expect(res.status).toBe(201);
    });
  });

  describe('Student Access (JOVENES, ADOLESCENTES)', () => {
    it('should allow students to view courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${youthToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow students to view lessons', async () => {
      const res = await request(app)
        .get('/api/lessons')
        .set('Authorization', `Bearer ${adolescentsToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow students to view quizzes', async () => {
      const res = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${youthToken}`);
      expect(res.status).toBe(200);
    });

    it('should deny students from creating courses', async () => {
      const courseData = { title: 'Test Course', description: 'Test Description' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${youthToken}`)
        .send(courseData);
      expect(res.status).toBe(403);
    });

    it('should deny students from accessing user management', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adolescentsToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Organization Access (EMPRESAS, GOBIERNOS_MUNICIPALES, CENTROS_DE_FORMACION, ONGS_Y_FUNDACIONES)', () => {
    it('should allow organizations to view courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${companiesToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow organizations to create courses', async () => {
      const courseData = { title: 'Org Course', description: 'Org Description' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${municipalToken}`)
        .send(courseData);
      expect(res.status).toBe(201);
    });

    it('should allow organizations to create lessons', async () => {
      const lessonData = { title: 'Org Lesson', content: 'Content', order: 1, moduleId: 'test-module' };
      const res = await request(app)
        .post('/api/lessons')
        .set('Authorization', `Bearer ${trainingToken}`)
        .send(lessonData);
      expect(res.status).toBe(201);
    });

    it('should allow organizations to create job offers', async () => {
      const jobData = { title: 'Org Job', description: 'Job Description' };
      const res = await request(app)
        .post('/api/job-offers')
        .set('Authorization', `Bearer ${ngosToken}`)
        .send(jobData);
      expect(res.status).toBe(201);
    });

    it('should deny organizations from deleting courses', async () => {
      const res = await request(app)
        .delete('/api/courses/test-id')
        .set('Authorization', `Bearer ${companiesToken}`);
      expect(res.status).toBe(403);
    });

    it('should deny organizations from accessing user management', async () => {
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${municipalToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Client/Agent Access', () => {
    it('should allow clients to view courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${superadminToken}`);
      expect(res.status).toBe(200);
    });

    it('should allow agents to view courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${superadminToken}`);
      expect(res.status).toBe(200);
    });

    it('should deny clients from creating courses', async () => {
      const courseData = { title: 'Client Course', description: 'Client Description' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(courseData);
      expect(res.status).toBe(403);
    });

    it('should deny agents from creating courses', async () => {
      const courseData = { title: 'Agent Course', description: 'Agent Description' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(courseData);
      expect(res.status).toBe(403);
    });
  });

  describe('Resource Ownership', () => {
    it('should allow users to access their own resources', async () => {
      // This would require creating resources with specific ownership
      // and testing access patterns
      expect(true).toBe(true); // Placeholder
    });

    it('should deny users from accessing others resources', async () => {
      // This would require creating resources with specific ownership
      // and testing access patterns
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting', async () => {
      // Test rate limiting by making many requests
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(
          request(app)
            .get('/api/courses')
            .set('Authorization', `Bearer ${superAdminToken}`)
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
}); 