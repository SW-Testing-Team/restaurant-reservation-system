/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model,Document } from 'mongoose';

import { FeedbackModule } from '../src/feedback/feedback.module';
import {
  RestaurantFeedback,
  RestaurantFeedbackSchema,
} from '../src/feedback/schemas/restaurant-feedback.schema';
import { User, UserSchema } from '../src/auth/entities/user.schema';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

// 🔹 IMPORT COUNTER SCHEMA
import {
  Counter,
  CounterSchema,
} from '../src/common/schemas/counter.schema'; // ⚠️ adjust path if needed

// Mock Guards
const mockJwtGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: '6928f77b243ef56d644c9113',
      role: 'customer',
    };
    return true;
  },
};

const mockAdminJwtGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: '6928f77b243ef56d644c9113',
      role: 'admin',
    };
    return true;
  },
};


const mockRolesGuard = {
  canActivate: () => true,
};

describe('FeedbackModule (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: RestaurantFeedback.name, schema: RestaurantFeedbackSchema },
          { name: User.name, schema: UserSchema },

          // ✅ REGISTER COUNTER SCHEMA
          { name: Counter.name, schema: CounterSchema },
        ]),
        FeedbackModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Seed user
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    await userModel.create({
      _id: '6928f77b243ef56d644c9113',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      phone: '123456789',
      password: 'test-password',
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('POST /feedback/addRestaurantFeedback → create restaurant feedback', async () => {
    const res = await request(app.getHttpServer())
      .post('/feedback/addRestaurantFeedback')
      .send({
        message: 'Great food and excellent service!',
        rating: 5,
      })
      .expect(201);

    expect(res.body._id).toBeDefined();
    expect(res.body.userId).toBe('6928f77b243ef56d644c9113');
    expect(res.body.message).toBe('Great food and excellent service!');
    expect(res.body.rating).toBe(5);
    expect(res.body.status).toBe('pending');
    expect(res.body.reply).toBeNull();
    expect(res.body.replyDate).toBeNull();
    expect(res.body.adminId).toBeNull();
  });

  it('GET /feedback/restaurantFeedback → return all feedbacks (sorted, populated)', async () => {
    await request(app.getHttpServer())
      .post('/feedback/addRestaurantFeedback')
      .send({
        message: 'Integration test feedback',
        rating: 4,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/feedback/restaurantFeedback')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const feedback = res.body[0];

    expect(feedback._id).toBeDefined();
    expect(feedback.message).toBeDefined();
    expect(feedback.rating).toBeDefined();
    expect(feedback.status).toBeDefined();
    expect(feedback.date).toBeDefined();

    // populated user
    expect(typeof feedback.userId).toBe('object');
    expect(feedback.userId._id).toBeDefined();
    expect(feedback.userId.email).toBeDefined();

    // admin optional
    if (feedback.adminId !== null) {
      expect(feedback.adminId._id).toBeDefined();
    } else {
      expect(feedback.adminId).toBeNull();
    }
  });

  it('PATCH /feedback/restaurant/:id/reply → admin replies to feedback', async () => {
    // 1️⃣ Create feedback first
    const createRes = await request(app.getHttpServer())
      .post('/feedback/addRestaurantFeedback')
      .send({
        message: 'Needs admin reply',
        rating: 3,
      })
      .expect(201);
  
    const feedbackId = createRes.body._id;
  
    // 2️⃣ Override JWT guard to act as ADMIN
    app
      .get(JwtAuthGuard)
      .canActivate = mockAdminJwtGuard.canActivate;
  
    // 3️⃣ Send admin reply
    const replyRes = await request(app.getHttpServer())
      .patch(`/feedback/restaurant/${feedbackId}/reply`)
      .send({
        reply: 'Thank you for your feedback!',
      })
      .expect(200);
  
    // 4️⃣ Assertions
    expect(replyRes.body._id).toBe(feedbackId);
    expect(replyRes.body.reply).toBe('Thank you for your feedback!');
    expect(replyRes.body.status).toBe('replied');
    expect(replyRes.body.replyDate).toBeDefined();
    expect(replyRes.body.adminId).toBe('6928f77b243ef56d644c9113');
  });
  




  it('GET /feedback/restaurant/stats → return correct dashboard statistics (admin)', async () => {
    // 1️⃣ Ensure we act as an ADMIN for this protected route
    app.get(JwtAuthGuard).canActivate = mockAdminJwtGuard.canActivate;
  
    const feedbackModel: Model<RestaurantFeedback> = app.get(
      getModelToken(RestaurantFeedback.name),
    );
  
    // Clear previous data for a clean test context
    await feedbackModel.deleteMany({});
  
    const userId = '6928f77b243ef56d644c9113';
    const adminId = '6928f77b243ef56d644c9113'; // Using the mock admin ID
  
    // 2️⃣ Setup known data for testing:
    await feedbackModel.create({
      message: 'Pending 1',
      rating: 5,
      userId: userId,
      status: 'pending',
    });
    await feedbackModel.create({
      message: 'Pending 2',
      rating: 4,
      userId: userId,
      status: 'pending',
    });
    await feedbackModel.create({
      message: 'Replied 1',
      rating: 2,
      userId: userId,
      status: 'replied',
      reply: 'Thank you',
      adminId: adminId,
      replyDate: new Date(),
    });
  
    // Total Feedbacks: 3
    // Pending Count: 2
    // Replied Count: 1
    // Average Rating: (5 + 4 + 2) / 3 = 11 / 3 ≈ 3.666666
  
    // 3️⃣ Send GET request to the stats endpoint
    const res = await request(app.getHttpServer())
      .get('/feedback/restaurant/stats')
      .expect(200);
  
    // 4️⃣ Assertions
    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe('object');
  
    expect(res.body.totalFeedbacks).toBe(3);
    expect(res.body.pendingCount).toBe(2);
    expect(res.body.repliedCount).toBe(1);
  
    // Use toBeCloseTo for floating point numbers
    expect(res.body.averageRating).toBe(3.6666666666666665);
  });



  it('GET /feedback/restaurantFeedbacks/recent → return the newest 5 feedbacks (sorted, transformed)', async () => {
    // Ensure we are using the CUSTOMER guard setting for the user ID
    app.get(JwtAuthGuard).canActivate = mockJwtGuard.canActivate;
  
    const feedbackModel: Model<RestaurantFeedback> = app.get(
      getModelToken(RestaurantFeedback.name),
    );
  
    const userId = '6928f77b243ef56d644c9113';
  
    // Clear previous data for a clean test context
    await feedbackModel.deleteMany({});
  
    // 1️⃣ Create 6 feedbacks with distinct, sequential dates and ratings
    const allFeedbacks: (RestaurantFeedback & Document)[] = []; 

    for (let i = 0; i < 6; i++) {
      // Create dates 6 days ago up to today, making 'today' the newest
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const feedback = await feedbackModel.create({
        message: `Feedback ${i + 1}`,
        rating: (i % 5) + 1, // Ratings 1 through 5, then 1 again
        userId: userId,
        date: date,
      });
      allFeedbacks.push(feedback);
    }
  
    // Feedback 6 (i=5) will be the newest.
    // Feedback 1 (i=0) will be the oldest and should be excluded.
  
    // 2️⃣ Send GET request to the recent feedbacks endpoint
    const res = await request(app.getHttpServer())
      .get('/feedback/restaurantFeedbacks/recent')
      .expect(200);
  
    // 3️⃣ Assertions
  
    // Check the structure and limit
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(5); // Only the 5 newest should be returned
  
    // Check data transformation and population
    const recentFeedback = res.body[0]; // This should be the newest (Feedback 6)
    expect(recentFeedback).toHaveProperty('username');
    expect(recentFeedback).toHaveProperty('rating');
    expect(recentFeedback).toHaveProperty('message');
    expect(recentFeedback).toHaveProperty('date');
  
    // Check the newest item (Feedback 6, created with i=5)
    expect(recentFeedback.message).toBe('Feedback 6');
    expect(recentFeedback.rating).toBe(1); // (5 % 5) + 1 = 1
    expect(recentFeedback.username).toBe('Test User'); // name from the seeded user
  
    // Check the oldest item in the result set (Feedback 2, created with i=1)
    const fifthFeedback = res.body[4];
    expect(fifthFeedback.message).toBe('Feedback 2');
    expect(fifthFeedback.rating).toBe(2); // (1 % 5) + 1 = 2
  
    // Ensure the oldest created item (Feedback 1, created with i=0) is NOT included
    const includedMessages = res.body.map(fb => fb.message);
    expect(includedMessages).not.toContain('Feedback 1');
  
    // Check descending sort order (newest first)
    const firstDate = new Date(recentFeedback.date).getTime();
    const lastDate = new Date(fifthFeedback.date).getTime();
    expect(firstDate).toBeGreaterThan(lastDate);
  });



  it('GET /feedback/restaurantFeedbacks/sorted-feedbacks → return all feedbacks sorted by date (newest first) and fully populated', async () => {
    // Reset guard to customer for general access (though this route looks like it could be for admin/internal use)
    app.get(JwtAuthGuard).canActivate = mockJwtGuard.canActivate;
  
    const feedbackModel: Model<RestaurantFeedback> = app.get(
      getModelToken(RestaurantFeedback.name),
    );
  
    const userId = '6928f77b243ef56d644c9113';
    const adminId = '6928f77b243ef56d644c9113';
  
    // Clear previous data
    await feedbackModel.deleteMany({});
  
    // 1️⃣ Setup test data with distinct dates for clear sorting verification
    const dateNewest = new Date(Date.now());
    const dateOldest = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7); // 7 days ago
  
    await feedbackModel.create({
      message: 'Newest Feedback',
      rating: 5,
      userId: userId,
      date: dateNewest,
      status: 'pending',
    });
  
    await feedbackModel.create({
      message: 'Oldest Feedback',
      rating: 1,
      userId: userId,
      date: dateOldest,
      status: 'replied',
      adminId: adminId,
      reply: 'Reply content',
    });
  
    // 2️⃣ Send GET request to the sorted feedbacks endpoint
    const res = await request(app.getHttpServer())
      .get('/feedback/restaurantFeedbacks/sorted-feedbacks')
      .expect(200);
  
    // 3️⃣ Assertions
  
    // Check array structure and length
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  
    const newestFeedback = res.body[0];
    const oldestFeedback = res.body[1];
  
    // Check Sorting: newest first
    expect(new Date(newestFeedback.date).getTime()).toBeGreaterThan(
      new Date(oldestFeedback.date).getTime(),
    );
    expect(newestFeedback.message).toBe('Newest Feedback');
    expect(oldestFeedback.message).toBe('Oldest Feedback');
  
    // Check full population on userId
    expect(typeof newestFeedback.userId).toBe('object');
    expect(newestFeedback.userId.name).toBe('Test User');
    expect(newestFeedback.userId.email).toBe('test@example.com');
    expect(newestFeedback.userId.phone).toBe('123456789'); // Ensure 'phone' is populated
  
    // Check full population on adminId (for the replied feedback)
    expect(typeof oldestFeedback.adminId).toBe('object');
    expect(oldestFeedback.adminId.name).toBe('Test User'); // Admin is the seeded user
    expect(oldestFeedback.adminId.email).toBe('test@example.com');
    expect(oldestFeedback.adminId.phone).toBe('123456789'); // Ensure 'phone' is populated
    
    // Check adminId is null for pending feedback
    expect(newestFeedback.adminId).toBeNull();
  });


});
