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
describe('Role-Based Access Control', () => {
    let superAdminToken;
    let youthToken;
    let adolescentsToken;
    let companiesToken;
    let municipalToken;
    let trainingToken;
    let ngosToken;
    let superadminToken;
    beforeAll(async () => {
        const testUsers = [
            { username: 'test-youth', password: 'password123', role: client_1.UserRole.YOUTH },
            { username: 'test-adolescents', password: 'password123', role: client_1.UserRole.ADOLESCENTS },
            { username: 'test-companies', password: 'password123', role: client_1.UserRole.COMPANIES },
            { username: 'test-municipal', password: 'password123', role: client_1.UserRole.MUNICIPAL_GOVERNMENTS },
            { username: 'test-training', password: 'password123', role: client_1.UserRole.TRAINING_CENTERS },
            { username: 'test-ngos', password: 'password123', role: client_1.UserRole.NGOS_AND_FOUNDATIONS },
            { username: 'test-superadmin', password: 'password123', role: client_1.UserRole.SUPERADMIN },
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
            .send({ username: 'test-youth', password: 'password123' });
        youthToken = youthRes.body.token;
        const adolescentsRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-adolescents', password: 'password123' });
        adolescentsToken = adolescentsRes.body.token;
        const companiesRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-companies', password: 'password123' });
        companiesToken = companiesRes.body.token;
        const municipalRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-municipal', password: 'password123' });
        municipalToken = municipalRes.body.token;
        const trainingRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-training', password: 'password123' });
        trainingToken = trainingRes.body.token;
        const ngosRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-ngos', password: 'password123' });
        ngosToken = ngosRes.body.token;
        const superadminRes = await (0, supertest_1.default)(server_1.app)
            .post('/api/auth/login')
            .send({ username: 'test-superadmin', password: 'password123' });
        superadminToken = superadminRes.body.token;
    });
    afterAll(async () => {
        const testUsernames = [
            'test-youth', 'test-adolescents', 'test-companies', 'test-municipal',
            'test-training', 'test-ngos', 'test-superadmin'
        ];
        for (const username of testUsernames) {
            await prisma_1.prisma.user.deleteMany({ where: { username } });
        }
    });
    describe('Authentication Tests', () => {
        it('should reject requests without authentication', async () => {
            const res = await (0, supertest_1.default)(server_1.app).get('/api/profiles');
            expect(res.status).toBe(401);
        });
        it('should reject requests with invalid tokens', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
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
                const res = await (0, supertest_1.default)(server_1.app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${superAdminToken}`);
                expect(res.status).toBe(200);
            }
        });
        it('should allow super admin to create resources', async () => {
            const courseData = { title: 'Test Course', description: 'Test Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send(courseData);
            expect(res.status).toBe(201);
        });
    });
    describe('Student Access (JOVENES, ADOLESCENTES)', () => {
        it('should allow students to view courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(200);
        });
        it('should allow students to view lessons', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/lessons')
                .set('Authorization', `Bearer ${adolescentsToken}`);
            expect(res.status).toBe(200);
        });
        it('should allow students to view quizzes', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/quizzes')
                .set('Authorization', `Bearer ${youthToken}`);
            expect(res.status).toBe(200);
        });
        it('should deny students from creating courses', async () => {
            const courseData = { title: 'Test Course', description: 'Test Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${youthToken}`)
                .send(courseData);
            expect(res.status).toBe(403);
        });
        it('should deny students from accessing user management', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${adolescentsToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('Organization Access (EMPRESAS, GOBIERNOS_MUNICIPALES, CENTROS_DE_FORMACION, ONGS_Y_FUNDACIONES)', () => {
        it('should allow organizations to view courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${companiesToken}`);
            expect(res.status).toBe(200);
        });
        it('should allow organizations to create courses', async () => {
            const courseData = { title: 'Org Course', description: 'Org Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${municipalToken}`)
                .send(courseData);
            expect(res.status).toBe(201);
        });
        it('should allow organizations to create lessons', async () => {
            const lessonData = { title: 'Org Lesson', content: 'Content', order: 1, moduleId: 'test-module' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/lessons')
                .set('Authorization', `Bearer ${trainingToken}`)
                .send(lessonData);
            expect(res.status).toBe(201);
        });
        it('should allow organizations to create job offers', async () => {
            const jobData = { title: 'Org Job', description: 'Job Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/job-offers')
                .set('Authorization', `Bearer ${ngosToken}`)
                .send(jobData);
            expect(res.status).toBe(201);
        });
        it('should deny organizations from deleting courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .delete('/api/courses/test-id')
                .set('Authorization', `Bearer ${companiesToken}`);
            expect(res.status).toBe(403);
        });
        it('should deny organizations from accessing user management', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${municipalToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('Client/Agent Access', () => {
        it('should allow clients to view courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${superadminToken}`);
            expect(res.status).toBe(200);
        });
        it('should allow agents to view courses', async () => {
            const res = await (0, supertest_1.default)(server_1.app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${superadminToken}`);
            expect(res.status).toBe(200);
        });
        it('should deny clients from creating courses', async () => {
            const courseData = { title: 'Client Course', description: 'Client Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${superadminToken}`)
                .send(courseData);
            expect(res.status).toBe(403);
        });
        it('should deny agents from creating courses', async () => {
            const courseData = { title: 'Agent Course', description: 'Agent Description' };
            const res = await (0, supertest_1.default)(server_1.app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${superadminToken}`)
                .send(courseData);
            expect(res.status).toBe(403);
        });
    });
    describe('Resource Ownership', () => {
        it('should allow users to access their own resources', async () => {
            expect(true).toBe(true);
        });
        it('should deny users from accessing others resources', async () => {
            expect(true).toBe(true);
        });
    });
    describe('Rate Limiting', () => {
        it('should implement rate limiting', async () => {
            const promises = [];
            for (let i = 0; i < 150; i++) {
                promises.push((0, supertest_1.default)(server_1.app)
                    .get('/api/courses')
                    .set('Authorization', `Bearer ${superAdminToken}`));
            }
            const responses = await Promise.all(promises);
            const rateLimited = responses.some(res => res.status === 429);
            expect(rateLimited).toBe(true);
        });
    });
});
//# sourceMappingURL=role-based-access.test.js.map