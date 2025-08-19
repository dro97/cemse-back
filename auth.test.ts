import request from 'supertest';
import { prisma } from './lib/prisma';
import { app } from './server';

describe('Auth/User CRUD (SUPER_ADMIN)', () => {
  let token: string;
  let refreshToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    // Login as super admin
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('should login and get a refresh token', async () => {
    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('should refresh the access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('should list all users', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'testuser1', password: 'testpass123', role: 'JOVENES', isActive: true });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser1');
    createdUserId = res.body.id;
  });

  it('should get the created user by ID', async () => {
    const res = await request(app)
      .get(`/api/auth/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testuser1');
  });

  it('should update the user', async () => {
    const res = await request(app)
      .put(`/api/auth/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newpass456', role: 'EMPRESAS', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('EMPRESAS');
    expect(res.body.isActive).toBe(false);
  });

  it('should delete the user', async () => {
    const res = await request(app)
      .delete(`/api/auth/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted.');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}); 