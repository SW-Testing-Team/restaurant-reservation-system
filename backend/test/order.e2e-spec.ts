import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserSchema } from '../src/auth/entities/user.schema';
import { Model } from 'mongoose';

import { MenuModule } from '../src/menu-order/menu.module'; // Your module that includes Order
import { MenuItem } from '../src/menu-order/models/MenuItem.schema';

describe('OrderController (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let menuItemModel: Model<MenuItem>;
  let menuItemId: string;
  let orderId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri), // Connect in-memory DB
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MenuModule, // Import your module directly
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get menuItem model
    menuItemModel = moduleFixture.get<Model<MenuItem>>(
      getModelToken(MenuItem.name),
    );

    // Create a menu item directly in DB for orders
    const menuItem = await menuItemModel.create({
      name: 'Burger',
      price: 50,
      category: 'Food',
    });
    menuItemId = menuItem._id.toString();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  // CREATE ORDER
  it('POST /orders → create order', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({
        userId: '507f1f77bcf86cd799439011',
        type: 'delivery',
        items: [{ menuItemId, quantity: 2 }],
      })
      .expect(201);

    orderId = res.body._id;
    expect(res.body.totalPrice).toBe(100);
    expect(res.body.items[0].menuItemId).toBe(menuItemId);
  });

  // GET ALL ORDERS
  it('GET /orders → get all orders', async () => {
    const res = await request(app.getHttpServer()).get('/orders').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // GET ONE ORDER
  it('GET /orders/:id → get one order', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .expect(200);
    expect(res.body._id).toBe(orderId);
  });

  // UPDATE ORDER STATUS
  it('PATCH /orders/:id/status → update status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'ready' })
      .expect(200);

    expect(res.body.status).toBe('ready');
  });

  // CANCEL ORDER
  it('PATCH /orders/:id/cancel → cancel order', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/cancel`)
      .expect(200);
    expect(res.body.status).toBe('cancelled');
  });

  // DELETE ORDER
  it('DELETE /orders/:id → delete order', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/orders/${orderId}`)
      .expect(200);
    expect(res.body.message).toBe('Order deleted successfully');
  });
});
