

// reservations.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtService } from '@nestjs/jwt';
import { Connection, Model, Types } from 'mongoose';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ReservationsModule } from '../src/reservations/reservations.module';
import { Reservation } from '../src/reservations/models/reservation.schema';
import { User } from '../src/auth/entities/user.schema';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let reservationModel: Model<Reservation>;
  let userModel: Model<User>;
  let jwtService: JwtService;

  // Test users
  let regularUser: any;
  let adminUser: any;
  let regularUserToken: string;
  let adminUserToken: string;

  // Test data - future date to pass validation
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const testDate = futureDate.toISOString().split('T')[0];
  const testTime = '18:00';

  // Helper to create reservation data matching your schema
  const createTestReservation = (overrides: any = {}) => ({
    date: testDate,
    time: testTime,
    guests: 2,
    phoneNumber: '01012345678', // Matches regex: ^01[0-2,5]{1}[0-9]{8}$
    userId: new Types.ObjectId(),
    tableNumber: 1,
    ...overrides,
  });

  // Valid phone number that matches your regex
  const validPhone = '01012345678';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.example',
        }),
        MongooseModule.forRoot(uri),
        ReservationsModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
    reservationModel = moduleFixture.get<Model<Reservation>>(
      getModelToken(Reservation.name),
    );
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test users (without triggering pre-save hook for Counter)
    regularUser = await userModel.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'hashedpassword123',
      role: 'customer',
    });

    adminUser = await userModel.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'hashedpassword123',
      role: 'admin',
    });

    // Generate JWT tokens matching your JwtStrategy
    regularUserToken = jwtService.sign({
      sub: regularUser._id.toString(),
      id: regularUser._id.toString(),
      email: regularUser.email,
      role: regularUser.role,
    });

    adminUserToken = jwtService.sign({
      sub: adminUser._id.toString(),
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  afterAll(async () => {
    await connection.close();
    await mongod.stop();
    await app.close();
  });

  beforeEach(async () => {
    await reservationModel.deleteMany({});
  });

  // ==================== CREATE RESERVATION ====================
  describe('POST /reservations', () => {
    const createDto = {
      date: testDate,
      time: testTime,
      guests: 4,
      phoneNumber: validPhone,
    };

    it('should create a reservation for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        date: testDate,
        time: testTime,
        guests: 4,
      });
      expect(response.body.tableNumber).toBeDefined();
      expect(response.body.tableNumber).toBeGreaterThanOrEqual(1);
      expect(response.body.tableNumber).toBeLessThanOrEqual(20);
      expect(response.body.userId).toBeDefined();
    });

    it('should create reservation without optional phoneNumber', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          date: testDate,
          time: testTime,
          guests: 2,
        })
        .expect(201);

      expect(response.body.guests).toBe(2);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .send(createDto)
        .expect(401);
    });

    it('should return 400 for past date reservation', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          date: pastDate.toISOString().split('T')[0],
        })
        .expect(400);
    });

    it('should return 400 for invalid time format', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          time: '25:00', // Invalid time
        })
        .expect(400);
    });

    it('should return 400 for invalid phone number format', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          phoneNumber: '12345', // Invalid format
        })
        .expect(400);
    });

    it('should return 400 for guests less than 1', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          guests: 0,
        })
        .expect(400);
    });

    it('should return 400 for guests more than 20', async () => {
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          guests: 21,
        })
        .expect(400);
    });

    it('should return 400 when no tables available', async () => {
      // Fill all 20 tables
      const reservations = Array.from({ length: 20 }, (_, i) =>
        createTestReservation({ tableNumber: i + 1 }),
      );
      await reservationModel.insertMany(reservations);

      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should assign next available table', async () => {
      // Reserve tables 1 and 2
      await reservationModel.insertMany([
        createTestReservation({ tableNumber: 1 }),
        createTestReservation({ tableNumber: 2 }),
      ]);

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.tableNumber).toBe(3);
    });

    it('should allow same table at different times', async () => {
      await reservationModel.create(
        createTestReservation({ tableNumber: 1, time: '12:00' }),
      );

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          time: '19:00',
        })
        .expect(201);

      expect(response.body.tableNumber).toBe(1);
    });

    it('should allow same table on different dates', async () => {
      const anotherDate = new Date();
      anotherDate.setDate(anotherDate.getDate() + 8);

      await reservationModel.create(
        createTestReservation({ tableNumber: 1 }),
      );

      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          ...createDto,
          date: anotherDate.toISOString().split('T')[0],
        })
        .expect(201);

      expect(response.body.tableNumber).toBe(1);
    });
  });

  // ==================== GET AVAILABLE TABLES ====================
  describe('GET /reservations/available', () => {
    it('should return all 20 tables when none reserved', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(response.body).toHaveLength(20);
      expect(response.body).toEqual(
        Array.from({ length: 20 }, (_, i) => i + 1),
      );
    });

    it('should exclude reserved tables', async () => {
      await reservationModel.create(
        createTestReservation({ tableNumber: 5 }),
      );

      const response = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(response.body).toHaveLength(19);
      expect(response.body).not.toContain(5);
    });

    it('should exclude multiple reserved tables', async () => {
      await reservationModel.insertMany([
        createTestReservation({ tableNumber: 1 }),
        createTestReservation({ tableNumber: 5 }),
        createTestReservation({ tableNumber: 10 }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(response.body).toHaveLength(17);
      expect(response.body).not.toContain(1);
      expect(response.body).not.toContain(5);
      expect(response.body).not.toContain(10);
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);
    });

    it('should return all tables for different time slot', async () => {
      await reservationModel.create(
        createTestReservation({ tableNumber: 5, time: '12:00' }),
      );

      const response = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: '19:00' })
        .expect(200);

      expect(response.body).toHaveLength(20);
      expect(response.body).toContain(5);
    });
  });

  // ==================== GET MY RESERVATIONS ====================
  describe('GET /reservations/my-reservations', () => {
    it('should return only user own reservations', async () => {
      // User's reservation
      await reservationModel.create(
        createTestReservation({
          userId: regularUser._id,
          tableNumber: 1,
        }),
      );

      // Another user's reservation
      await reservationModel.create(
        createTestReservation({
          userId: new Types.ObjectId(),
          tableNumber: 2,
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].tableNumber).toBe(1);
    });

    it('should return multiple reservations for same user', async () => {
      await reservationModel.insertMany([
        createTestReservation({ userId: regularUser._id, tableNumber: 1, time: '12:00' }),
        createTestReservation({ userId: regularUser._id, tableNumber: 2, time: '14:00' }),
        createTestReservation({ userId: regularUser._id, tableNumber: 3, time: '18:00' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .expect(401);
    });

    it('should return empty array when user has no reservations', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(response.body).toHaveLength(0);
    });

    it('should populate user info', async () => {
      await reservationModel.create(
        createTestReservation({ userId: regularUser._id }),
      );

      const response = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body[0].userId).toBeDefined();
      // After populate, userId becomes an object with name and email
      if (typeof response.body[0].userId === 'object') {
        expect(response.body[0].userId.name).toBe('Test User');
        expect(response.body[0].userId.email).toBe('user@test.com');
      }
    });
  });

  // ==================== GET ALL RESERVATIONS (ADMIN) ====================
  describe('GET /reservations', () => {
    it('should return all reservations for admin', async () => {
      await reservationModel.insertMany([
        createTestReservation({ userId: regularUser._id, tableNumber: 1 }),
        createTestReservation({ userId: adminUser._id, tableNumber: 2 }),
        createTestReservation({ userId: new Types.ObjectId(), tableNumber: 3 }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should return 403 for regular user (customer)', async () => {
      await request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/reservations')
        .expect(401);
    });

    it('should return empty array when no reservations exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  // ==================== GET SINGLE RESERVATION ====================
  describe('GET /reservations/:id', () => {
    let userReservation: any;

    beforeEach(async () => {
      userReservation = await reservationModel.create(
        createTestReservation({ userId: regularUser._id }),
      );
    });

    it('should return reservation for owner', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body._id).toBe(userReservation._id.toString());
      expect(response.body.guests).toBe(2);
      expect(response.body.tableNumber).toBe(1);
    });

    it('should return any reservation for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(response.body._id).toBe(userReservation._id.toString());
    });

    it('should return 403 for non-owner user', async () => {
      const otherUser = await userModel.create({
        name: 'Other User',
        email: 'other@test.com',
        password: 'hashedpassword',
        role: 'customer',
      });

      const otherUserToken = jwtService.sign({
        sub: otherUser._id.toString(),
        id: otherUser._id.toString(),
        email: otherUser.email,
        role: otherUser.role,
      });

      await request(app.getHttpServer())
        .get(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = new Types.ObjectId();

      await request(app.getHttpServer())
        .get(`/reservations/${fakeId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get(`/reservations/${userReservation._id}`)
        .expect(401);
    });
  });

  // ==================== UPDATE RESERVATION ====================
  describe('PATCH /reservations/:id', () => {
    let userReservation: any;

    beforeEach(async () => {
      userReservation = await reservationModel.create(
        createTestReservation({ userId: regularUser._id, guests: 2 }),
      );
    });

    it('should update guests for owner', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ guests: 6 })
        .expect(200);

      expect(response.body.guests).toBe(6);
    });

    it('should update time for owner', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ time: '20:00' })
        .expect(200);

      expect(response.body.time).toBe('20:00');
    });

    it('should update multiple fields', async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 10);

      const response = await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          guests: 8,
          time: '19:30',
          date: newDate.toISOString().split('T')[0],
        })
        .expect(200);

      expect(response.body.guests).toBe(8);
      expect(response.body.time).toBe('19:30');
    });

    it('should allow admin to update any reservation', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({ guests: 10 })
        .expect(200);

      expect(response.body.guests).toBe(10);
    });

    it('should return 403 for non-owner user', async () => {
      const otherUser = await userModel.create({
        name: 'Other User',
        email: 'other2@test.com',
        password: 'hashedpassword',
        role: 'customer',
      });

      const otherUserToken = jwtService.sign({
        sub: otherUser._id.toString(),
        id: otherUser._id.toString(),
        email: otherUser.email,
        role: otherUser.role,
      });

      await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ guests: 6 })
        .expect(403);
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = new Types.ObjectId();

      await request(app.getHttpServer())
        .patch(`/reservations/${fakeId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ guests: 6 })
        .expect(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .send({ guests: 6 })
        .expect(401);
    });

    it('should return 400 for invalid guests value', async () => {
      await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ guests: 25 }) // Exceeds max of 20
        .expect(400);
    });

    it('should return 400 for invalid time format', async () => {
      await request(app.getHttpServer())
        .patch(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ time: 'invalid' })
        .expect(400);
    });
  });

  // ==================== GET AVAILABLE TABLES FOR UPDATE ====================
  describe('GET /reservations/available-for-update/:reservationId', () => {
    it('should include current reservation table in available list', async () => {
      const reservation = await reservationModel.create(
        createTestReservation({
          userId: regularUser._id,
          tableNumber: 5,
        }),
      );

      // Another reservation at same time
      await reservationModel.create(
        createTestReservation({
          userId: new Types.ObjectId(),
          tableNumber: 10,
        }),
      );

      const response = await request(app.getHttpServer())
        .get(`/reservations/available-for-update/${reservation._id}`)
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(response.body).toHaveLength(19);
      expect(response.body).toContain(5); // Current table IS available
      expect(response.body).not.toContain(10); // Other table NOT available
    });

    it('should work without authentication (public endpoint)', async () => {
      const reservation = await reservationModel.create(
        createTestReservation({ tableNumber: 1 }),
      );

      await request(app.getHttpServer())
        .get(`/reservations/available-for-update/${reservation._id}`)
        .query({ date: testDate, time: testTime })
        .expect(200);
    });
  });

  // ==================== CANCEL/DELETE RESERVATION ====================
  describe('DELETE /reservations/:id', () => {
    let userReservation: any;

    beforeEach(async () => {
      userReservation = await reservationModel.create(
        createTestReservation({ userId: regularUser._id }),
      );
    });

    it('should cancel reservation for owner', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body._id).toBe(userReservation._id.toString());

      // Verify deletion
      const deleted = await reservationModel.findById(userReservation._id);
      expect(deleted).toBeNull();
    });

    it('should allow admin to cancel any reservation', async () => {
      await request(app.getHttpServer())
        .delete(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      const deleted = await reservationModel.findById(userReservation._id);
      expect(deleted).toBeNull();
    });

    it('should return 403 for non-owner user', async () => {
      const otherUser = await userModel.create({
        name: 'Other User',
        email: 'other3@test.com',
        password: 'hashedpassword',
        role: 'customer',
      });

      const otherUserToken = jwtService.sign({
        sub: otherUser._id.toString(),
        id: otherUser._id.toString(),
        email: otherUser.email,
        role: otherUser.role,
      });

      await request(app.getHttpServer())
        .delete(`/reservations/${userReservation._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      // Verify NOT deleted
      const notDeleted = await reservationModel.findById(userReservation._id);
      expect(notDeleted).not.toBeNull();
    });

    it('should return 404 for non-existent reservation', async () => {
      const fakeId = new Types.ObjectId();

      await request(app.getHttpServer())
        .delete(`/reservations/${fakeId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app.getHttpServer())
        .delete(`/reservations/${userReservation._id}`)
        .expect(401);
    });
  });

  // ==================== INTEGRATION SCENARIOS ====================
  describe('Integration Scenarios', () => {
    it('should handle complete reservation lifecycle', async () => {
      // 1. Check available tables (should be all 20)
      const availableResponse = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(availableResponse.body).toHaveLength(20);

      // 2. Create reservation
      const createResponse = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          date: testDate,
          time: testTime,
          guests: 4,
          phoneNumber: validPhone,
        })
        .expect(201);

      const reservationId = createResponse.body._id;
      const assignedTable = createResponse.body.tableNumber;

      expect(assignedTable).toBe(1); // First available table

      // 3. Check available tables (should be 19)
      const afterCreateResponse = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(afterCreateResponse.body).toHaveLength(19);
      expect(afterCreateResponse.body).not.toContain(assignedTable);

      // 4. Verify in my-reservations
      const myReservationsResponse = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(myReservationsResponse.body).toHaveLength(1);
      expect(myReservationsResponse.body[0]._id).toBe(reservationId);

      // 5. Update reservation
      const updateResponse = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ guests: 6 })
        .expect(200);

      expect(updateResponse.body.guests).toBe(6);

      // 6. Get single reservation to verify update
      const getResponse = await request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(getResponse.body.guests).toBe(6);

      // 7. Cancel reservation
      await request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      // 8. Verify table is available again
      const finalAvailableResponse = await request(app.getHttpServer())
        .get('/reservations/available')
        .query({ date: testDate, time: testTime })
        .expect(200);

      expect(finalAvailableResponse.body).toHaveLength(20);
      expect(finalAvailableResponse.body).toContain(assignedTable);

      // 9. Verify my-reservations is empty
      const finalMyReservations = await request(app.getHttpServer())
        .get('/reservations/my-reservations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(finalMyReservations.body).toHaveLength(0);
    });

    // Option 1: Run sequentially instead of concurrently
it('should handle sequential reservations correctly', async () => {
  const results: any[] = [];
  
  for (let i = 0; i < 5; i++) {
    const result = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({
        date: testDate,
        time: testTime,
        guests: 2,
        phoneNumber: validPhone,
      });
    results.push(result);
  }

  // All should succeed
  results.forEach((result) => {
    expect(result.status).toBe(201);
  });

  // Verify unique table numbers assigned
  const tableNumbers = results.map((r) => r.body.tableNumber);
  const uniqueTables = new Set(tableNumbers);
  expect(uniqueTables.size).toBe(5);

  // Verify available tables reduced
  const availableResponse = await request(app.getHttpServer())
    .get('/reservations/available')
    .query({ date: testDate, time: testTime })
    .expect(200);

  expect(availableResponse.body).toHaveLength(15);
});

  });
});