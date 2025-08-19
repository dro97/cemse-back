"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('API Integration Tests', () => {
    let superAdminToken;
    let youthToken;
    let companiesToken;
    let superadminToken;
    beforeAll(async () => {
        const testUsers = [
            { username: 'test-youth-int', password: 'password123', role: client_1.UserRole.YOUTH },
            { username: 'test-companies-int', password: 'password123', role: client_1.UserRole.COMPANIES },
            { username: 'test-superadmin-int', password: 'password123', role: client_1.UserRole.SUPERADMIN },
        ];
        for (const userData of testUsers) {
            const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
            await prisma_1.prisma.user.upsert({
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
        const adminRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        superAdminToken = adminRes.body.token;
        const youthRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-youth-int', password: 'password123' });
        youthToken = youthRes.body.token;
        const companiesRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-companies-int', password: 'password123' });
        companiesToken = companiesRes.body.token;
        const superadminRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-superadmin-int', password: 'password123' });
        superadminToken = superadminRes.body.token;
    });
    afterAll(async () => {
        const testUsernames = ['test-youth-int', 'test-companies-int', 'test-superadmin-int'];
        for (const username of testUsernames) {
            await prisma_1.prisma.user.deleteMany({ where: { username } });
        }
    });
    describe('Authentication Endpoints', () => {
        it('should allow user registration', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/register')
                .send({
                username: 'test-register',
                password: 'password123',
                role: 'YOUTH'
            });
            expect(res.status).toBe(201);
        });
        it('should allow user login', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/auth/login')
                .send({
                username: 'test-youth-int',
                password: 'password123'
            });
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });
        it('should get current user info', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(200);
            expect(res.body.user.username).toBe('test-youth-int');
        });
    });
    describe('Course Endpoints', () => {
        let createdCourseId;
        it('should allow organizations to create courses', async () => {
            const courseData = {
                title: 'Integration Test Course',
                description: 'Course created during integration test'
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(courseData);
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(courseData.title);
            createdCourseId = res.body.id;
        });
        it('should allow all users to view courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('should allow organizations to update courses', async () => {
            const updateData = { title: 'Updated Course Title' };
            const res = await (0, supertest_1.default)(server_1.app)
                .put(`/api/courses/${createdCourseId}`)
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(updateData);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe(updateData.title);
        });
        it('should deny students from creating courses', async () => {
            const courseData = { title: 'Student Course', description: 'Should be denied' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(courseData);
            expect(res.status).toBe(403);
        });
        it('should allow super admin to delete courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .delete(`/api/courses/${createdCourseId}`)
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.status).toBe(204);
        });
    });
    describe('Lesson Endpoints', () => {
        let createdLessonId;
        it('should allow organizations to create lessons', async () => {
            const lessonData = {
                title: 'Integration Test Lesson',
                content: 'Lesson content for testing',
                order: 1,
                moduleId: 'test-module-id'
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/lessons')
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(lessonData);
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(lessonData.title);
            createdLessonId = res.body.id;
        });
        it('should allow all users to view lessons', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/lessons')
                .set('Authorization', `Bearer ${superadminToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('should allow organizations to update lessons', async () => {
            const updateData = { title: 'Updated Lesson Title' };
            const res = await (0, supertest_1.default)(server_1.app)
                .put(`/api/lessons/${createdLessonId}`)
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(updateData);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe(updateData.title);
        });
        it('should allow super admin to delete lessons', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .delete(`/api/lessons/${createdLessonId}`)
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.status).toBe(204);
        });
    });
    describe('Quiz Endpoints', () => {
        let createdQuizId;
        it('should allow organizations to create quizzes', async () => {
            const quizData = {
                title: 'Integration Test Quiz',
                description: 'Quiz for testing',
                moduleId: 'test-module-id',
                timeLimit: 30,
                isActive: true
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(quizData);
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(quizData.title);
            createdQuizId = res.body.id;
        });
        it('should allow all users to view quizzes', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/quizzes')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('should allow organizations to update quizzes', async () => {
            const updateData = { title: 'Updated Quiz Title' };
            const res = await (0, supertest_1.default)(server_1.app)
                .put(`/api/quizzes/${createdQuizId}`)
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(updateData);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe(updateData.title);
        });
        it('should allow super admin to delete quizzes', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .delete(`/api/quizzes/${createdQuizId}`)
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.status).toBe(204);
        });
    });
    describe('Job Offer Endpoints', () => {
        let createdJobId;
        it('should allow organizations to create job offers', async () => {
            const jobData = {
                title: 'Integration Test Job',
                description: 'Job offer for testing',
                requirements: 'Test requirements',
                salary: '50000',
                location: 'Test Location'
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/job-offers')
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(jobData);
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(jobData.title);
            createdJobId = res.body.id;
        });
        it('should allow all users to view job offers', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/job-offers')
                .set('Authorization', `Bearer ${superadminToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('should allow organizations to update job offers', async () => {
            const updateData = { title: 'Updated Job Title' };
            const res = await (0, supertest_1.default)(server_1.app)
                .put(`/api/job-offers/${createdJobId}`)
                .set('Authorization', `Bearer ${companiesToken}`)
                .send(updateData);
            expect(res.status).toBe(200);
            expect(res.body.title).toBe(updateData.title);
        });
        it('should allow super admin to delete job offers', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .delete(`/api/job-offers/${createdJobId}`)
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.status).toBe(204);
        });
    });
    describe('Student-Specific Endpoints', () => {
        let createdEnrollmentId;
        let createdProgressId;
        it('should allow students to create course enrollments', async () => {
            const enrollmentData = {
                studentId: 'test-student-id',
                courseId: 'test-course-id',
                enrolledAt: new Date().toISOString()
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/course-enrollments')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(enrollmentData);
            expect(res.status).toBe(201);
            createdEnrollmentId = res.body.id;
            expect(createdEnrollmentId).toBeDefined();
        });
        it('should allow students to create lesson progress', async () => {
            const progressData = {
                studentId: 'test-student-id',
                lessonId: 'test-lesson-id',
                completed: true,
                completedAt: new Date().toISOString()
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/lesson-progress')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(progressData);
            expect(res.status).toBe(201);
            createdProgressId = res.body.id;
            expect(createdProgressId).toBeDefined();
        });
        it('should allow students to create quiz attempts', async () => {
            const attemptData = {
                studentId: 'test-student-id',
                quizId: 'test-quiz-id',
                startedAt: new Date().toISOString(),
                score: 85
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/quiz-attempts')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(attemptData);
            expect(res.status).toBe(201);
        });
        it('should allow students to create student notes', async () => {
            const noteData = {
                content: 'Test student note',
                studentId: 'test-student-id',
                lessonId: 'test-lesson-id'
            };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/student-notes')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(noteData);
            expect(res.status).toBe(201);
        });
    });
    describe('Error Handling', () => {
        it('should return 404 for non-existent resources', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses/non-existent-id')
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.status).toBe(404);
        });
        it('should return 400 for invalid data', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${companiesToken}`)
                .send({});
            expect(res.status).toBe(400);
        });
        it('should return 401 for missing authentication', async () => {
            const res = await (0, supertest_1.default)(server_1.app).get('/api/courses');
            expect(res.status).toBe(401);
        });
        it('should return 403 for unauthorized access', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('Health Check', () => {
        it('should return health status', async () => {
            const res = await (0, supertest_1.default)(server_1.app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });
});
//# sourceMappingURL=integration.test.js.map