import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/auth/entities/user.schema';
import { Reservation } from '../src/reservations/models/reservation.schema';
import { Order } from '../src/menu-order/models/Order.schema';
import { MenuItem } from '../src/menu-order/models/MenuItem.schema';
import { RestaurantFeedback } from '../src/feedback/schemas/restaurant-feedback.schema';
import { ItemFeedback } from '../src/feedback/schemas/menu-item-feedback.schema';
import cookieParser from 'cookie-parser';

// User Story: As an admin, I want to view real-time analytics so that I can make informed decisions
describe('Dashboard (e2e)', () => {
  jest.setTimeout(30000); // Increase timeout for this test suite (30 seconds)

  let app: INestApplication<App>;
  let adminToken: string;
  let customerToken: string;
  let adminUserId: string;
  let customerUserId: string;
  let menuItem1Id: string;
  let menuItem2Id: string;
  let menuItem3Id: string;
  let createdReservationIds: string[] = [];
  let createdOrderIds: string[] = [];
  let createdMenuItemIds: string[] = [];
  let createdRestaurantFeedbackIds: string[] = [];
  let createdItemFeedbackIds: string[] = [];
  let createdUserIds: string[] = [];

  // Model references for cleanup
  let userModel: Model<User>;
  let reservationModel: Model<Reservation>;
  let orderModel: Model<Order>;
  let menuItemModel: Model<MenuItem>;
  let restaurantFeedbackModel: Model<RestaurantFeedback>;
  let itemFeedbackModel: Model<ItemFeedback>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    // Get model references for cleanup
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    reservationModel = moduleFixture.get<Model<Reservation>>(
      getModelToken(Reservation.name),
    );
    orderModel = moduleFixture.get<Model<Order>>(getModelToken(Order.name));
    menuItemModel = moduleFixture.get<Model<MenuItem>>(
      getModelToken(MenuItem.name),
    );
    restaurantFeedbackModel = moduleFixture.get<Model<RestaurantFeedback>>(
      getModelToken(RestaurantFeedback.name),
    );
    itemFeedbackModel = moduleFixture.get<Model<ItemFeedback>>(
      getModelToken(ItemFeedback.name),
    );

    // Create admin user
    const adminEmail = `admin-e2e-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
      })
      .expect(201);

    adminUserId = adminRegisterResponse.body.data.id;
    createdUserIds.push(adminUserId);

    // Login as admin to get token
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: 'admin123',
      })
      .expect(200);

    // Extract token from cookie
    const adminCookies = adminLoginResponse.headers['set-cookie'];
    const tokenCookie = adminCookies?.find((cookie: string) =>
      cookie.startsWith('token='),
    );
    adminToken = tokenCookie?.split('=')[1]?.split(';')[0] || '';

    // Create customer user
    const customerEmail = `customer-e2e-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const customerRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Customer User',
        email: customerEmail,
        password: 'customer123',
        role: 'customer',
      })
      .expect(201);

    customerUserId = customerRegisterResponse.body.data.id;
    createdUserIds.push(customerUserId);

    // Login as customer to get token
    const customerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: customerEmail,
        password: 'customer123',
      })
      .expect(200);

    const customerCookies = customerLoginResponse.headers['set-cookie'];
    const customerTokenCookie = customerCookies?.find((cookie: string) =>
      cookie.startsWith('token='),
    );
    customerToken = customerTokenCookie?.split('=')[1]?.split(';')[0] || '';

    // Create menu items with unique names to avoid duplicates
    const uniqueId = Date.now();
    const menuItem1Response = await request(app.getHttpServer())
      .post('/menu/items')
      .send({
        name: `Test Pizza ${uniqueId}`,
        description: 'Test Pizza Description',
        price: 12.99,
        category: 'Main Course',
        available: true,
      })
      .expect(201);

    menuItem1Id = menuItem1Response.body._id || menuItem1Response.body.id;
    createdMenuItemIds.push(menuItem1Id);

    const menuItem2Response = await request(app.getHttpServer())
      .post('/menu/items')
      .send({
        name: `Test Burger ${uniqueId}`,
        description: 'Test Burger Description',
        price: 8.99,
        category: 'Main Course',
        available: true,
      })
      .expect(201);

    menuItem2Id = menuItem2Response.body._id || menuItem2Response.body.id;
    createdMenuItemIds.push(menuItem2Id);

    const menuItem3Response = await request(app.getHttpServer())
      .post('/menu/items')
      .send({
        name: `Test Salad ${uniqueId}`,
        description: 'Test Salad Description',
        price: 6.99,
        category: 'Appetizer',
        available: true,
      })
      .expect(201);

    menuItem3Id = menuItem3Response.body._id || menuItem3Response.body.id;
    createdMenuItemIds.push(menuItem3Id);

    // Create orders
    const order1Response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        userId: customerUserId,
        type: 'dine-in',
        tableNumber: 5,
        items: [
          { menuItemId: menuItem1Id, quantity: 2 }, // 12.99 * 2 = 25.98
          { menuItemId: menuItem2Id, quantity: 1 }, // 8.99 * 1 = 8.99
        ],
      })
      .expect(201);

    createdOrderIds.push(order1Response.body._id || order1Response.body.id);

    const order2Response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        userId: customerUserId,
        type: 'takeaway',
        items: [
          { menuItemId: menuItem1Id, quantity: 3 }, // 12.99 * 3 = 38.97
        ],
      })
      .expect(201);

    createdOrderIds.push(order2Response.body._id || order2Response.body.id);

    const order3Response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        userId: customerUserId,
        type: 'delivery',
        items: [
          { menuItemId: menuItem3Id, quantity: 5 }, // 6.99 * 5 = 34.95
        ],
      })
      .expect(201);

    createdOrderIds.push(order3Response.body._id || order3Response.body.id);

    // Create reservations
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const reservation1Response = await request(app.getHttpServer())
      .post('/reservations')
      .set('Cookie', [`token=${customerToken}`])
      .send({
        date: tomorrowStr,
        time: '18:00',
        phoneNumber: '01234567890',
        guests: 4,
      })
      .expect(201);

    createdReservationIds.push(
      reservation1Response.body._id || reservation1Response.body.id,
    );

    const reservation2Response = await request(app.getHttpServer())
      .post('/reservations')
      .set('Cookie', [`token=${customerToken}`])
      .send({
        date: tomorrowStr,
        time: '19:00',
        phoneNumber: '01234567891',
        guests: 2,
      })
      .expect(201);

    createdReservationIds.push(
      reservation2Response.body._id || reservation2Response.body.id,
    );

    // Create restaurant feedback
    const restaurantFeedback1Response = await request(app.getHttpServer())
      .post('/feedback/addRestaurantFeedback')
      .set('Cookie', [`token=${customerToken}`])
      .send({
        message: 'Great restaurant!',
        rating: 5,
      })
      .expect(201);

    createdRestaurantFeedbackIds.push(
      restaurantFeedback1Response.body._id ||
        restaurantFeedback1Response.body.id,
    );

    const restaurantFeedback2Response = await request(app.getHttpServer())
      .post('/feedback/addRestaurantFeedback')
      .set('Cookie', [`token=${customerToken}`])
      .send({
        message: 'Good food',
        rating: 4,
      })
      .expect(201);

    createdRestaurantFeedbackIds.push(
      restaurantFeedback2Response.body._id ||
        restaurantFeedback2Response.body.id,
    );

    // Create item feedback
    const itemFeedback1Response = await request(app.getHttpServer())
      .post(`/feedback/addItemFeedback/${menuItem1Id}`)
      .set('Cookie', [`token=${customerToken}`])
      .send({
        message: 'Delicious pizza!',
        rating: 5,
      })
      .expect(201);

    createdItemFeedbackIds.push(
      itemFeedback1Response.body._id || itemFeedback1Response.body.id,
    );

    const itemFeedback2Response = await request(app.getHttpServer())
      .post(`/feedback/addItemFeedback/${menuItem2Id}`)
      .set('Cookie', [`token=${customerToken}`])
      .send({
        message: 'Great burger',
        rating: 4,
      })
      .expect(201);

    createdItemFeedbackIds.push(
      itemFeedback2Response.body._id || itemFeedback2Response.body.id,
    );
  });

  afterAll(async () => {
    // Clean up all test data
    if (createdReservationIds.length > 0) {
      await reservationModel.deleteMany({
        _id: { $in: createdReservationIds },
      });
    }
    if (createdOrderIds.length > 0) {
      await orderModel.deleteMany({ _id: { $in: createdOrderIds } });
    }
    if (createdMenuItemIds.length > 0) {
      await menuItemModel.deleteMany({ _id: { $in: createdMenuItemIds } });
    }
    if (createdRestaurantFeedbackIds.length > 0) {
      await restaurantFeedbackModel.deleteMany({
        _id: { $in: createdRestaurantFeedbackIds },
      });
    }
    if (createdItemFeedbackIds.length > 0) {
      await itemFeedbackModel.deleteMany({
        _id: { $in: createdItemFeedbackIds },
      });
    }
    if (createdUserIds.length > 0) {
      await userModel.deleteMany({ _id: { $in: createdUserIds } });
    }
    await app.close();
  });

  // User Story: As an admin, I want to view real-time analytics so that I can make informed decisions
  describe('GET /dashboard/stats', () => {
    it('should allow admin to retrieve dashboard statistics', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body.totalReservations).toBeDefined();
      expect(response.body.totalOrders).toBeDefined();
      expect(response.body.totalRevenue).toBeDefined();
      expect(response.body.topMenuItems).toBeDefined();
      expect(response.body.feedbackSummary).toBeDefined();
    });

    it('should return statistics with all required fields', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert - Check all required fields exist
      expect(response.body).toHaveProperty('totalReservations');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('topMenuItems');
      expect(response.body).toHaveProperty('feedbackSummary');

      // Check feedback summary fields
      expect(response.body.feedbackSummary).toHaveProperty('totalFeedback');
      expect(response.body.feedbackSummary).toHaveProperty('averageRating');
      expect(response.body.feedbackSummary).toHaveProperty('pendingFeedback');
      expect(response.body.feedbackSummary).toHaveProperty('repliedFeedback');
      expect(response.body.feedbackSummary).toHaveProperty(
        'restaurantFeedback',
      );
      expect(response.body.feedbackSummary).toHaveProperty('itemFeedback');

      // Verify types
      expect(typeof response.body.totalReservations).toBe('number');
      expect(typeof response.body.totalOrders).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('number');
      expect(Array.isArray(response.body.topMenuItems)).toBe(true);
      expect(typeof response.body.feedbackSummary.totalFeedback).toBe('number');
      expect(typeof response.body.feedbackSummary.averageRating).toBe('number');
    });

    it('should return top menu items sorted by order count descending', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert
      const topMenuItems = response.body.topMenuItems;
      expect(Array.isArray(topMenuItems)).toBe(true);

      // Check if items are sorted by orderCount descending
      if (topMenuItems.length > 1) {
        for (let i = 0; i < topMenuItems.length - 1; i++) {
          expect(topMenuItems[i].orderCount).toBeGreaterThanOrEqual(
            topMenuItems[i + 1].orderCount,
          );
        }
      }

      // Verify structure of top menu items
      if (topMenuItems.length > 0) {
        expect(topMenuItems[0]).toHaveProperty('menuItem');
        expect(topMenuItems[0]).toHaveProperty('orderCount');
        expect(topMenuItems[0].menuItem).toHaveProperty('name');
        expect(topMenuItems[0].menuItem).toHaveProperty('price');
        expect(topMenuItems[0].menuItem).toHaveProperty('category');
      }
    });

    it('should calculate revenue accurately when new orders are added', async () => {
      // Arrange - Get initial revenue
      const initialResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      const initialRevenue = initialResponse.body.totalRevenue;
      const initialOrderCount = initialResponse.body.totalOrders;

      // Create a new order
      const newOrderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          userId: customerUserId,
          type: 'dine-in',
          items: [{ menuItemId: menuItem2Id, quantity: 2 }], // 8.99 * 2 = 17.98
        })
        .expect(201);

      const newOrderId = newOrderResponse.body._id || newOrderResponse.body.id;
      createdOrderIds.push(newOrderId);

      // Act - Get updated revenue
      const updatedResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert
      expect(updatedResponse.body.totalOrders).toBe(initialOrderCount + 1);
      // Revenue should increase by 17.98 (allowing for floating point precision)
      const expectedRevenue = initialRevenue + 17.98;
      expect(
        Math.abs(updatedResponse.body.totalRevenue - expectedRevenue),
      ).toBeLessThan(0.01);
    });

    it('should update reservation count when new reservation is created', async () => {
      // Arrange - Get initial reservation count
      const initialResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      const initialReservationCount = initialResponse.body.totalReservations;

      // Create a new reservation
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const newReservationResponse = await request(app.getHttpServer())
        .post('/reservations')
        .set('Cookie', [`token=${customerToken}`])
        .send({
          date: tomorrowStr,
          time: '20:00',
          phoneNumber: '01234567892',
          guests: 3,
        })
        .expect(201);

      const newReservationId =
        newReservationResponse.body._id || newReservationResponse.body.id;
      createdReservationIds.push(newReservationId);

      // Act - Get updated reservation count
      const updatedResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert
      expect(updatedResponse.body.totalReservations).toBe(
        initialReservationCount + 1,
      );
    });

    it('should update feedback statistics when new feedback is submitted', async () => {
      // Arrange - Get initial feedback stats
      const initialResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      const initialTotalFeedback =
        initialResponse.body.feedbackSummary.totalFeedback;
      const initialRestaurantFeedback =
        initialResponse.body.feedbackSummary.restaurantFeedback;
      const initialItemFeedback =
        initialResponse.body.feedbackSummary.itemFeedback;

      // Create new restaurant feedback
      const newRestaurantFeedbackResponse = await request(app.getHttpServer())
        .post('/feedback/addRestaurantFeedback')
        .set('Cookie', [`token=${customerToken}`])
        .send({
          message: 'Excellent service!',
          rating: 5,
        })
        .expect(201);

      createdRestaurantFeedbackIds.push(
        newRestaurantFeedbackResponse.body._id ||
          newRestaurantFeedbackResponse.body.id,
      );

      // Create new item feedback
      const newItemFeedbackResponse = await request(app.getHttpServer())
        .post(`/feedback/addItemFeedback/${menuItem3Id}`)
        .set('Cookie', [`token=${customerToken}`])
        .send({
          message: 'Tasty salad!',
          rating: 4,
        })
        .expect(201);

      createdItemFeedbackIds.push(
        newItemFeedbackResponse.body._id || newItemFeedbackResponse.body.id,
      );

      // Act - Get updated feedback stats
      const updatedResponse = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert
      expect(updatedResponse.body.feedbackSummary.totalFeedback).toBe(
        initialTotalFeedback + 2,
      );
      expect(updatedResponse.body.feedbackSummary.restaurantFeedback).toBe(
        initialRestaurantFeedback + 1,
      );
      expect(updatedResponse.body.feedbackSummary.itemFeedback).toBe(
        initialItemFeedback + 1,
      );
    });

    it('should deny access to customer users (403 Forbidden)', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${customerToken}`])
        .expect(403);
    });

    it('should deny access to unauthenticated users (401 Unauthorized)', async () => {
      // Act & Assert
      await request(app.getHttpServer()).get('/dashboard/stats').expect(401);
    });

    it('should reject invalid tokens (401 Unauthorized)', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', ['token=invalid-token-12345'])
        .expect(401);
    });

    it('should calculate correct statistics with real data', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      // Assert - Verify statistics are reasonable
      expect(response.body.totalReservations).toBeGreaterThanOrEqual(2); // We created at least 2
      expect(response.body.totalOrders).toBeGreaterThanOrEqual(3); // We created at least 3
      expect(response.body.totalRevenue).toBeGreaterThan(0);
      expect(
        response.body.feedbackSummary.totalFeedback,
      ).toBeGreaterThanOrEqual(4); // We created at least 4 feedback items
      expect(
        response.body.feedbackSummary.averageRating,
      ).toBeGreaterThanOrEqual(0);
      expect(response.body.feedbackSummary.averageRating).toBeLessThanOrEqual(
        5,
      );

      // Verify top menu items structure
      // Note: We don't check for specific names since they include unique IDs
      expect(response.body.topMenuItems.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recent Activity - TDD Feature', () => {
    it('should return 10 most recent activities across all types', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(10);

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('details');

        if (response.body.length > 1) {
          const firstDate = new Date(response.body[0].date).getTime();
          const secondDate = new Date(response.body[1].date).getTime();
          expect(firstDate).toBeGreaterThanOrEqual(secondDate);
        }
      }
    });

    it('should deny access to non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Cookie', [`token=${customerToken}`])
        .expect(403);
    });
  });
});
