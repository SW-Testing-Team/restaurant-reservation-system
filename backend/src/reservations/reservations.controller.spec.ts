import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservations.controller';
import { ReservationService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    create: jest.fn(),
    getAvailableTables: jest.fn(),
    getUserReservations: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    getAvailableTablesForUpdate: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      role: 'user',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    })
      // ✅ Mock Guards so they always allow access
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a reservation', async () => {
      const dto = { date: '2025-01-01', time: '18:00', tableId: '1' };
      const result = { id: 'res-1' };

      mockReservationService.create.mockResolvedValue(result);

      expect(await controller.create(dto as any, mockRequest)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto, mockRequest.user.id);
    });
  });

  describe('getAvailable()', () => {
    it('should return available tables', async () => {
      mockReservationService.getAvailableTables.mockResolvedValue(['table1']);

      const result = await controller.getAvailable('2025-01-01', '18:00');

      expect(result).toEqual(['table1']);
      expect(service.getAvailableTables).toHaveBeenCalledWith(
        '2025-01-01',
        '18:00',
      );
    });
  });

  describe('getMyReservations()', () => {
    it('should return user reservations', async () => {
      const reservations = [{ id: 'res-1' }];
      mockReservationService.getUserReservations.mockResolvedValue(reservations);

      const result = await controller.getMyReservations(mockRequest);

      expect(result).toEqual(reservations);
      expect(service.getUserReservations).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
    });
  });

  describe('findAll()', () => {
    it('should return all reservations (admin)', async () => {
      const reservations = [{ id: 'res-1' }, { id: 'res-2' }];
      mockReservationService.findAll.mockResolvedValue(reservations);

      const result = await controller.findAll();

      expect(result).toEqual(reservations);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return reservation for user', async () => {
      const reservation = { id: 'res-1' };
      mockReservationService.findOne.mockResolvedValue(reservation);

      const result = await controller.findOne('res-1', mockRequest);

      expect(result).toEqual(reservation);
      expect(service.findOne).toHaveBeenCalledWith(
        'res-1',
        mockRequest.user.id,
      );
    });

    it('should allow admin to access any reservation', async () => {
      const adminReq = { user: { id: 'admin-1', role: 'admin' } };
      const reservation = { id: 'res-1' };

      mockReservationService.findOne.mockResolvedValue(reservation);

      const result = await controller.findOne('res-1', adminReq);

      expect(result).toEqual(reservation);
      expect(service.findOne).toHaveBeenCalledWith('res-1', undefined);
    });
  });

  describe('update()', () => {
    it('should update reservation for user', async () => {
      const dto = { time: '19:00' };
      const updated = { id: 'res-1', time: '19:00' };

      mockReservationService.update.mockResolvedValue(updated);

      const result = await controller.update('res-1', dto as any, mockRequest);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(
        'res-1',
        dto,
        mockRequest.user.id,
      );
    });
  });

  describe('getAvailableTablesForUpdate()', () => {
    it('should return available tables excluding current reservation', async () => {
      mockReservationService.getAvailableTablesForUpdate.mockResolvedValue([
        'table2',
      ]);

      const result = await controller.getAvailableTablesForUpdate(
        '2025-01-01',
        '18:00',
        'res-1',
      );

      expect(result).toEqual(['table2']);
      expect(service.getAvailableTablesForUpdate).toHaveBeenCalledWith(
        '2025-01-01',
        '18:00',
        'res-1',
      );
    });
  });

  describe('cancel()', () => {
    it('should cancel reservation for user', async () => {
      const cancelled = { success: true };
      mockReservationService.cancel.mockResolvedValue(cancelled);

      const result = await controller.cancel('res-1', mockRequest);

      expect(result).toEqual(cancelled);
      expect(service.cancel).toHaveBeenCalledWith(
        'res-1',
        mockRequest.user.id,
      );
    });

    it('should allow admin to cancel any reservation', async () => {
      const adminReq = { user: { id: 'admin-1', role: 'admin' } };
      const cancelled = { success: true };

      mockReservationService.cancel.mockResolvedValue(cancelled);

      const result = await controller.cancel('res-1', adminReq);

      expect(result).toEqual(cancelled);
      expect(service.cancel).toHaveBeenCalledWith('res-1', undefined);
    });
  });
});
