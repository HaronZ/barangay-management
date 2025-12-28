import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
    };

    // Clean up test data before and after tests
    beforeAll(async () => {
        // Delete test user if exists (including linked person)
        const existingUser = await prisma.user.findUnique({ where: { email: testUser.email }, include: { person: true } });
        if (existingUser) {
            if (existingUser.person) {
                await prisma.person.delete({ where: { id: existingUser.person.id } });
            }
            await prisma.user.delete({ where: { id: existingUser.id } });
        }
    });

    afterAll(async () => {
        // Clean up test user
        const existingUser = await prisma.user.findUnique({ where: { email: testUser.email }, include: { person: true } });
        if (existingUser) {
            if (existingUser.person) {
                await prisma.person.delete({ where: { id: existingUser.person.id } });
            }
            await prisma.user.delete({ where: { id: existingUser.id } });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully (returns verification message)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body.status).toBe('success');
            // With email verification, no token is returned immediately
            // Check data.message contains verification info
            expect(response.body.data.message).toContain('verify');
        });

        it('should reject duplicate email registration', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(400);

            expect(response.body.status).toBe('fail');
            expect(response.body.message).toContain('already exists');
        });

        it('should reject registration with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email',
                })
                .expect(400);

            expect(response.body.status).toBe('fail');
        });
    });

    describe('POST /api/auth/login', () => {
        // Before login tests, verify the test user so they can login
        beforeAll(async () => {
            await prisma.user.update({
                where: { email: testUser.email },
                data: { emailVerified: true },
            });
        });

        it('should login with valid credentials (verified user)', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe(testUser.email);
        });

        it('should reject login with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.status).toBe('fail');
            expect(response.body.message).toContain('Invalid');
        });

        it('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'anypassword',
                })
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        it('should reject login for unverified user', async () => {
            // Create an unverified user
            const unverifiedEmail = 'unverified@example.com';
            const hashedPassword = await bcrypt.hash('testpass123', 10);

            // Clean up if exists
            const existing = await prisma.user.findUnique({ where: { email: unverifiedEmail } });
            if (existing) {
                await prisma.user.delete({ where: { id: existing.id } });
            }

            await prisma.user.create({
                data: {
                    email: unverifiedEmail,
                    password: hashedPassword,
                    emailVerified: false,
                },
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: unverifiedEmail,
                    password: 'testpass123',
                })
                .expect(403);

            expect(response.body.status).toBe('fail');
            expect(response.body.message).toContain('verify');

            // Clean up
            await prisma.user.delete({ where: { email: unverifiedEmail } });
        });
    });

    describe('GET /api/auth/profile', () => {
        let authToken: string;

        beforeAll(async () => {
            // Login to get token (user should be verified from previous tests)
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });
            authToken = response.body.data?.token;
        });

        it('should get profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.person).toBeDefined();
        });

        it('should reject profile request without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        it('should reject profile request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.status).toBe('fail');
        });
    });
});
