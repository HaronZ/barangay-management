import request from 'supertest';
import app from '../app.js';
import prisma from '../lib/prisma.js';

describe('Person API', () => {
    let adminToken: string;
    let residentToken: string;
    let testPersonId: string;

    // Get auth tokens before tests
    beforeAll(async () => {
        // Login as admin
        const adminResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@barangay.gov.ph',
                password: 'password123',
            });
        adminToken = adminResponse.body.data?.token;

        // Login as resident
        const residentResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'resident@gmail.com',
                password: 'password123',
            });
        residentToken = residentResponse.body.data?.token;
    });

    afterAll(async () => {
        // Clean up any test persons created
        if (testPersonId) {
            await prisma.person.deleteMany({
                where: { id: testPersonId },
            });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/persons', () => {
        it('should return list of persons for authenticated user', async () => {
            if (!adminToken) {
                console.warn('Skipping test: admin token not available (run seed first)');
                return;
            }

            const response = await request(app)
                .get('/api/persons')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.persons).toBeDefined();
            expect(Array.isArray(response.body.data.persons)).toBe(true);
            expect(response.body.data.pagination).toBeDefined();
        });

        it('should reject request without authentication', async () => {
            const response = await request(app)
                .get('/api/persons')
                .expect(401);

            expect(response.body.status).toBe('fail');
        });
    });

    describe('POST /api/persons', () => {
        const newPerson = {
            firstName: 'Test',
            lastName: 'Person',
            birthDate: '1990-01-15',
            gender: 'MALE',
            civilStatus: 'SINGLE',
            address: '123 Test Street',
        };

        it('should create a person when admin is authenticated', async () => {
            if (!adminToken) {
                console.warn('Skipping test: admin token not available');
                return;
            }

            const response = await request(app)
                .post('/api/persons')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newPerson)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.firstName).toBe(newPerson.firstName);
            expect(response.body.data.lastName).toBe(newPerson.lastName);

            testPersonId = response.body.data.id;
        });

        it('should reject create when resident tries to create', async () => {
            if (!residentToken) {
                console.warn('Skipping test: resident token not available');
                return;
            }

            const response = await request(app)
                .post('/api/persons')
                .set('Authorization', `Bearer ${residentToken}`)
                .send(newPerson)
                .expect(403);

            expect(response.body.status).toBe('fail');
        });
    });

    describe('GET /api/persons/:id', () => {
        it('should get a person by ID', async () => {
            if (!adminToken || !testPersonId) {
                console.warn('Skipping test: prerequisites not met');
                return;
            }

            const response = await request(app)
                .get(`/api/persons/${testPersonId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.id).toBe(testPersonId);
        });

        it('should return error for non-existent person', async () => {
            if (!adminToken) {
                console.warn('Skipping test: admin token not available');
                return;
            }

            const response = await request(app)
                .get('/api/persons/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`);

            // Should return 404 
            expect(response.status).toBe(404);
            expect(response.body.status).toBe('fail');
        });
    });
});
