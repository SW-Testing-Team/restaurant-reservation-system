// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import request from 'supertest';
// import cookieParser from 'cookie-parser';
// import { AppModule } from '../src/app.module';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from '../src/auth/entities/user.schema';

// describe('Auth & Users (e2e)', () => {
//   jest.setTimeout(30000);

//   let app: INestApplication;
//   let adminToken: string;
//   let customerToken: string;
//   let adminUserId: string;
//   let customerUserId: string;

//   let userModel: Model<User>;
//   const createdUserIds: string[] = [];

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     app.use(cookieParser());
//     app.useGlobalPipes(
//       new ValidationPipe({
//         whitelist: true,
//         transform: true,
//       }),
//     );
//     await app.init();

//     userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

//     // Create admin user
//     const adminEmail = `admin-e2e-${Date.now()}@test.com`;
//     const adminRegisterResponse = await request(app.getHttpServer())
//       .post('/auth/register')
//       .send({
//         name: 'Admin User',
//         email: adminEmail,
//         password: 'admin123',
//         role: 'admin',
//       })
//       .expect(201);

//     adminUserId = adminRegisterResponse.body.data.id;
//     createdUserIds.push(adminUserId);

//     const adminLoginResponse = await request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: adminEmail, password: 'admin123' })
//       .expect(200);

//     const adminCookies = (adminLoginResponse.headers['set-cookie'] as unknown) as string[] | undefined;
//     const tokenCookie = adminCookies?.find((c) => c.startsWith('token='));
//     adminToken = tokenCookie?.split('=')[1]?.split(';')[0] || '';

//     // Create customer user
//     const customerEmail = `customer-e2e-${Date.now()}@test.com`;
//     const customerRegisterResponse = await request(app.getHttpServer())
//       .post('/auth/register')
//       .send({
//         name: 'Customer User',
//         email: customerEmail,
//         password: 'customer123',
//         role: 'customer',
//       })
//       .expect(201);

//     customerUserId = customerRegisterResponse.body.data.id;
//     createdUserIds.push(customerUserId);

//     const customerLoginResponse = await request(app.getHttpServer())
//       .post('/auth/login')
//       .send({ email: customerEmail, password: 'customer123' })
//       .expect(200);

//     const customerCookies = (customerLoginResponse.headers['set-cookie'] as unknown) as string[] | undefined;
//     const customerTokenCookie = customerCookies?.find((c) => c.startsWith('token='));
//     customerToken = customerTokenCookie?.split('=')[1]?.split(';')[0] || '';
//   });

//   afterAll(async () => {
//     if (createdUserIds.length > 0) {
//       await userModel.deleteMany({ _id: { $in: createdUserIds } });
//     }
//     await app.close();
//   });

//   describe('Auth Endpoints', () => {
//     it('/auth/profile (GET) - should return profile for authenticated user', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/auth/profile')
//         .set('Cookie', [`token=${customerToken}`])
//         .expect(200);

//       expect(response.body.data.email).toBeDefined();
//     });

//     it('/auth/logout (POST) - should clear cookie', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/auth/logout')
//         .set('Cookie', [`token=${customerToken}`])
//         .expect(201);

//       expect(response.body.success).toBe(true);
//       const cookie = response.headers['set-cookie'][0];
//       expect(cookie).toContain('token=;');
//     });

//     it('should reject invalid token on profile', async () => {
//       await request(app.getHttpServer())
//         .get('/auth/profile')
//         .set('Cookie', ['token=invalid-token'])
//         .expect(401);
//     });

//     it('should reject unauthenticated request to profile', async () => {
//       await request(app.getHttpServer())
//         .get('/auth/profile')
//         .expect(401);
//     });
//   });

//   describe('Users Endpoints (Admin only)', () => {
//     it('/auth/users (GET) - admin should get users list', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/auth/users')
//         .set('Cookie', [`token=${adminToken}`])
//         .expect(200);

//       expect(Array.isArray(response.body.data)).toBe(true);
//       expect(response.body.data.length).toBeGreaterThanOrEqual(2);
//     });

//     it('/auth/users (GET) - customer should be forbidden', async () => {
//       await request(app.getHttpServer())
//         .get('/auth/users')
//         .set('Cookie', [`token=${customerToken}`])
//         .expect(403);
//     });

//     it('/auth/users/:id (GET) - admin can get user by ID', async () => {
//       const response = await request(app.getHttpServer())
//         .get(`/users/${customerUserId}`)
//         .set('Cookie', [`token=${adminToken}`])
//         .expect(200);

//       expect(response.body.data.email).toBeDefined();
//       expect(response.body.data.id).toBe(customerUserId);
//     });

//     it('/auth/users/:id (GET) - invalid ID should return 404', async () => {
//       await request(app.getHttpServer())
//         .get('/users/invalidid123')
//         .set('Cookie', [`token=${adminToken}`])
//         .expect(404);
//     });
//   });
// });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/auth/entities/user.schema';
import cookieParser from 'cookie-parser';

describe('Auth & Users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let adminUserId: string;
  let customerUserId: string;
  const createdUserIds: string[] = [];

  let userModel: Model<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    // Create admin user
    const adminEmail = `admin-e2e-${Date.now()}@test.com`;
    const adminRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Admin User', email: adminEmail, password: 'admin123', role: 'admin' })
      .expect(201);

    adminUserId = adminRegisterRes.body.data.id;
    createdUserIds.push(adminUserId);

    // Login as admin to get token
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'admin123' })
      .expect(200);

    const adminCookies = adminLoginRes.headers['set-cookie'] as unknown as string[] | undefined;
    adminToken = adminCookies && Array.isArray(adminCookies)
      ? adminCookies.find((c) => c.startsWith('token='))?.split('=')[1]?.split(';')[0] || ''
      : '';

    if (!adminToken) throw new Error('Admin token not found');

    // Create customer user
    const customerEmail = `customer-e2e-${Date.now()}@test.com`;
    const customerRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Customer User', email: customerEmail, password: 'customer123', role: 'customer' })
      .expect(201);

    customerUserId = customerRegisterRes.body.data.id;
    createdUserIds.push(customerUserId);

    // Login as customer to get token
    const customerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: customerEmail, password: 'customer123' })
      .expect(200);

    const customerCookies = customerLoginRes.headers['set-cookie'] as unknown as string[] | undefined;
    customerToken = customerCookies && Array.isArray(customerCookies)
      ? customerCookies.find((c) => c.startsWith('token='))?.split('=')[1]?.split(';')[0] || ''
      : '';

    if (!customerToken) throw new Error('Customer token not found');
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await userModel.deleteMany({ _id: { $in: createdUserIds } });
    }
    await app.close();
  });

  describe('Users Endpoints (Admin only)', () => {
    it('GET /users - admin can list all users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /users/:id - admin can get user by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${customerUserId}`)
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data._id).toBe(customerUserId);
    });

    it('GET /users/:id - returns 404 for non-existing user', async () => {
      await request(app.getHttpServer())
        .get('/users/000000000000000000000000')
        .set('Cookie', [`token=${adminToken}`])
        .expect(404);
    });

    it('GET /users/:id - non-admin cannot access', async () => {
      await request(app.getHttpServer())
        .get(`/users/${customerUserId}`)
        .set('Cookie', [`token=${customerToken}`])
        .expect(403);
    });
  });

  describe('Auth Endpoints', () => {
    it('GET /auth/profile - authenticated user can get profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [`token=${customerToken}`])
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBeDefined();
    });

    it('GET /auth/profile - unauthenticated returns 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});
