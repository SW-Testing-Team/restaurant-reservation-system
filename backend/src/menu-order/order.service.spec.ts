import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './models/Order.schema';
import { MenuItem } from './models/MenuItem.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('OrderService (Unit)', () => {
  let service: OrderService;

  // ---------- Shared save mock ----------
  const saveMock = jest.fn();

  // ---------- Order Model Mock ----------
  const OrderModelMock = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as any;

  OrderModelMock.find = jest.fn();
  OrderModelMock.findById = jest.fn();
  OrderModelMock.findByIdAndUpdate = jest.fn();
  OrderModelMock.findByIdAndDelete = jest.fn();

  // ---------- MenuItem Model Mock ----------
  const MenuItemModelMock = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as any;

  MenuItemModelMock.findById = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order.name),
          useValue: OrderModelMock,
        },
        {
          provide: getModelToken(MenuItem.name),
          useValue: MenuItemModelMock,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // createOrder
  // =============================
  describe('createOrder', () => {
    it('should throw BadRequestException if userId invalid', async () => {
      await expect(
        service.createOrder({
          userId: 'invalid',
          items: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if menu item not found', async () => {
      const menuItemId = new Types.ObjectId().toHexString();
      MenuItemModelMock.findById.mockResolvedValue(null);

      await expect(
        service.createOrder({
          userId: new Types.ObjectId().toHexString(),
          items: [{ menuItemId, quantity: 1 }],
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create order successfully', async () => {
      const menuItemId = new Types.ObjectId().toHexString();
      MenuItemModelMock.findById.mockResolvedValue({ price: 50 });

      saveMock.mockResolvedValue({
        totalPrice: 100,
      });

      const result = await service.createOrder({
        userId: new Types.ObjectId().toHexString(),
        items: [{ menuItemId, quantity: 2 }],
      } as any);

      expect(MenuItemModelMock.findById).toHaveBeenCalledWith(menuItemId);
      expect(saveMock).toHaveBeenCalled();
      expect(result.totalPrice).toBe(100);
    });
  });

  // =============================
  // getAll
  // =============================
  describe('getAll', () => {
    it('should return all orders', async () => {
      const orders = [{ id: '1' }];
      OrderModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(orders),
          }),
        }),
      });

      const result = await service.getAll();
      expect(result).toEqual(orders);
    });
  });

  // =============================
  // getOne
  // =============================
  describe('getOne', () => {
    it('should return order if found', async () => {
      const order = { id: '1' };
      OrderModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(order),
          }),
        }),
      });

      const result = await service.getOne('1');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found', async () => {
      OrderModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.getOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  // =============================
  // updateStatus
  // =============================
  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const order = { id: '1', status: 'delivered' };
      OrderModelMock.findByIdAndUpdate.mockResolvedValue(order);

      const result = await service.updateStatus('1', { status: 'delivered' });

      expect(OrderModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { status: 'delivered' },
        { new: true },
      );
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found', async () => {
      OrderModelMock.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.updateStatus('1', { status: 'delivered' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =============================
  // cancelOrder
  // =============================
  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      const order = { id: '1', status: 'cancelled' };
      OrderModelMock.findByIdAndUpdate.mockResolvedValue(order);

      const result = await service.cancelOrder('1');
      expect(result.status).toBe('cancelled');
    });

    it('should throw NotFoundException if order not found', async () => {
      OrderModelMock.findByIdAndUpdate.mockResolvedValue(null);
      await expect(service.cancelOrder('1')).rejects.toThrow(NotFoundException);
    });
  });

  // =============================
  // deleteOrder
  // =============================
  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      OrderModelMock.findByIdAndDelete.mockResolvedValue({ id: '1' });

      const result = await service.deleteOrder('1');
      expect(result).toEqual({ message: 'Order deleted successfully' });
    });

    it('should throw NotFoundException if order not found', async () => {
      OrderModelMock.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.deleteOrder('1')).rejects.toThrow(NotFoundException);
    });
  });
});
