import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './Order.controller';
import { OrderService } from './Order.service';
import { CreateOrderDto } from './DTO/CreateOrder.dto';
import { UpdateOrderStatusDto } from './DTO/UpdateOrder.dto';

describe('OrderController (Unit)', () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  const mockOrderService = {
    createOrder: jest.fn(),
    getAll: jest.fn(),
    getOne: jest.fn(),
    updateStatus: jest.fn(),
    cancelOrder: jest.fn(),
    deleteOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // CREATE ORDER
  // =============================
  describe('create', () => {
    it('should call service.createOrder with DTO', async () => {
      const dto: CreateOrderDto = { userId: '1', items: [] } as any;
      const result = { id: 'order1' };
      service.createOrder.mockResolvedValue(result as any);

      const res = await controller.create(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(res).toEqual(result);
    });
  });

  // =============================
  // GET ALL ORDERS
  // =============================
  describe('findAll', () => {
    it('should return all orders', async () => {
      const result = [{ id: '1' }];
      service.getAll.mockResolvedValue(result as any);

      const res = await controller.findAll();

      expect(service.getAll).toHaveBeenCalled();
      expect(res).toEqual(result);
    });
  });

  // =============================
  // GET ONE ORDER
  // =============================
  describe('findOne', () => {
    it('should return one order', async () => {
      const result = { id: '1' };
      service.getOne.mockResolvedValue(result as any);

      const res = await controller.findOne('1');

      expect(service.getOne).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });
  });

  // =============================
  // UPDATE ORDER STATUS
  // =============================
  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      const dto: UpdateOrderStatusDto = { status: 'delivered' } as any;
      const result = { id: '1', status: 'delivered' };
      service.updateStatus.mockResolvedValue(result as any);

      const res = await controller.updateStatus('1', dto);

      expect(service.updateStatus).toHaveBeenCalledWith('1', dto);
      expect(res).toEqual(result);
    });
  });

  // =============================
  // CANCEL ORDER
  // =============================
  describe('cancel', () => {
    it('should call service.cancelOrder', async () => {
      const result = { id: '1', status: 'cancelled' };
      service.cancelOrder.mockResolvedValue(result as any);

      const res = await controller.cancel('1');

      expect(service.cancelOrder).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });
  });

  // =============================
  // DELETE ORDER
  // =============================
  describe('remove', () => {
    it('should call service.deleteOrder', async () => {
      const result = { message: 'Order deleted successfully' };
      service.deleteOrder.mockResolvedValue(result as any);

      const res = await controller.remove('1');

      expect(service.deleteOrder).toHaveBeenCalledWith('1');
      expect(res).toEqual(result);
    });
  });
});
