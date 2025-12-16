
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationService } from './reservations.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('ReservationService', () => {
  let service: ReservationService;
  let model: any;

  const mockReservationModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    populate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getModelToken('Reservation'),
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    model = module.get(getModelToken('Reservation'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------- CREATE --------------------
  describe('create()', () => {
    it('should throw error for past date', async () => {
      const dto = { date: '2020-01-01', time: '18:00' };

      await expect(service.create(dto as any, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when no tables available', async () => {
      mockReservationModel.find.mockResolvedValue(
        Array.from({ length: 20 }, (_, i) => ({ tableNumber: i + 1 })),
      );

      const dto = { date: '2099-01-01', time: '18:00' };

      await expect(service.create(dto as any, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

it('should auto-assign a table and create reservation', async () => {
  mockReservationModel.find.mockResolvedValue([
    { tableNumber: 1 },
    { tableNumber: 2 },
  ]);

  mockReservationModel.create.mockResolvedValue({
    tableNumber: 3,
  });

  const dto = { date: '2099-01-01', time: '18:00' };
  const userId = new Types.ObjectId().toString();

  const result = await service.create(dto as any, userId);

  expect(model.create).toHaveBeenCalledWith(
    expect.objectContaining({
      tableNumber: 3,
      userId: expect.any(Types.ObjectId),
    }),
  );

  expect(result.tableNumber).toBe(3);
});
  });

  // -------------------- AVAILABLE TABLES --------------------
  describe('getAvailableTables()', () => {
    it('should return available tables', async () => {
      mockReservationModel.find.mockResolvedValue([
        { tableNumber: 1 },
        { tableNumber: 2 },
      ]);

      const result = await service.getAvailableTables('2099-01-01', '18:00');

      expect(result).toContain(3);
      expect(result.length).toBe(18);
    });
  });

  // -------------------- FIND ALL --------------------
  describe('findAll()', () => {
    it('should return all reservations', async () => {
      const populatedResult = [{ id: '1' }];

      mockReservationModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(populatedResult),
      });

      const result = await service.findAll();

      expect(result).toEqual(populatedResult);
    });
  });

  // -------------------- FIND ONE --------------------
  describe('findOne()', () => {
    const reservationId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    it('should throw not found if reservation does not exist', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne(reservationId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw forbidden if user does not own reservation', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          userId: new Types.ObjectId(),
        }),
      });

      await expect(
        service.findOne(reservationId.toString(), userId.toString()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return reservation for owner', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          userId,
        }),
      });


      const result = await service.findOne(
        reservationId.toString(),
        userId.toString(),
      );

        expect(result.userId.toString()).toBe(userId.toString());

    });

    it('should allow admin access', async () => {
      mockReservationModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          userId,
        }),
      });

      const result = await service.findOne(reservationId.toString());

      expect(result).toBeDefined();
    });
  });

  // -------------------- UPDATE --------------------
  describe('update()', () => {
    const reservationId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    it('should throw not found', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(
        service.update(reservationId.toString(), {}, userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw forbidden for non-owner', async () => {
      mockReservationModel.findById.mockResolvedValue({
        userId: new Types.ObjectId(),
      });

      await expect(
        service.update(reservationId.toString(), {}, userId.toString()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update reservation', async () => {
      mockReservationModel.findById.mockResolvedValue({ userId });

      mockReservationModel.findByIdAndUpdate.mockResolvedValue({
        time: '19:00',
      });

      const result = await service.update(
        reservationId.toString(),
        { time: '19:00' } as any,
        userId.toString(),
      );

       expect(result).not.toBeNull();
       expect(result!.time).toBe('19:00');
    });
  });

  // -------------------- AVAILABLE TABLES FOR UPDATE --------------------
  describe('getAvailableTablesForUpdate()', () => {
    it('should exclude current reservation', async () => {
      mockReservationModel.find.mockResolvedValue([
        { tableNumber: 1 },
        { tableNumber: 2 },
      ]);

      const result = await service.getAvailableTablesForUpdate(
        '2099-01-01',
        '18:00',
        new Types.ObjectId().toString(),
      );

      expect(result).not.toContain(1);
      expect(result).toContain(3);
    });
  });

  // -------------------- CANCEL --------------------
  describe('cancel()', () => {
    const reservationId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    it('should throw not found', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(
        service.cancel(reservationId.toString(), userId.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw forbidden for non-owner', async () => {
      mockReservationModel.findById.mockResolvedValue({
        userId: new Types.ObjectId(),
      });

      await expect(
        service.cancel(reservationId.toString(), userId.toString()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete reservation', async () => {
      mockReservationModel.findById.mockResolvedValue({ userId });
      mockReservationModel.findByIdAndDelete.mockResolvedValue({});

      const result = await service.cancel(
        reservationId.toString(),
        userId.toString(),
      );

      expect(result).toBeDefined();
    });
  });

  // -------------------- USER RESERVATIONS --------------------
  describe('getUserReservations()', () => {
    it('should return reservations for user', async () => {
      const userId = new Types.ObjectId();

      mockReservationModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ id: '1' }]),
      });

      const result = await service.getUserReservations(userId.toString());

      expect(result.length).toBe(1);
    });
  });
});
