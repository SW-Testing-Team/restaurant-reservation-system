/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { MenuModule } from '../src/menu-order/menu.module';

describe('MenuController (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MenuModule, // REAL module
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  // =============================
  // CREATE MENU
  // =============================
  it('POST /menu → create menu', async () => {
    const res = await request(app.getHttpServer())
      .post('/menu')
      .send({ title: 'Lunch Menu' })
      .expect(201);

    expect(res.body.title).toBe('Lunch Menu');
    expect(res.body._id).toBeDefined();
  });

  // =============================
  // GET ALL MENUS
  // =============================
  it('GET /menu → get all menus', async () => {
    const res = await request(app.getHttpServer()).get('/menu').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // =============================
  // CREATE MENU ITEM
  // =============================
  let menuItemId: string;
  it('POST /menu/items → create menu item', async () => {
    const res = await request(app.getHttpServer())
      .post('/menu/items')
      .send({
        name: 'Burger',
        price: 50,
        category: 'Food',
      })
      .expect(201);

    menuItemId = res.body._id;

    expect(res.body.name).toBe('Burger');
    expect(res.body.price).toBe(50);
  });

  // =============================
  // ADD MENU ITEM TO MENU
  // =============================
  let menuId: string;
  it('PATCH /menu/:id/items/:itemId → add item to menu', async () => {
    // create menu
    const menuRes = await request(app.getHttpServer())
      .post('/menu')
      .send({ title: 'Dinner Menu' });

    menuId = menuRes.body._id;

    const res = await request(app.getHttpServer())
      .patch(`/menu/${menuId}/items/${menuItemId}`)
      .expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0]._id).toBe(menuItemId);
  });

  // =============================
  // REMOVE MENU ITEM
  // =============================
  it('DELETE /menu/:id/items/:itemId → remove item', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/menu/${menuId}/items/${menuItemId}`)
      .expect(200);

    expect(res.body.items.length).toBe(0);
  });

  // =============================
  // DELETE MENU ITEM
  // =============================
  it('DELETE /menu/items/:itemId → delete menu item', async () => {
    await request(app.getHttpServer())
      .delete(`/menu/items/${menuItemId}`)
      .expect(200);
  });

  // =============================
  // DELETE MENU
  // =============================
  it('DELETE /menu/:id → delete menu', async () => {
    await request(app.getHttpServer()).delete(`/menu/${menuId}`).expect(200);
  });
});
