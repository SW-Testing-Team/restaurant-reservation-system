import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardService } from './dashboard.service';
import { Reservation } from '../reservations/models/reservation.schema';
import { Order } from '../menu-order/models/Order.schema';
import { MenuItem } from '../menu-order/models/MenuItem.schema';
import { RestaurantFeedback } from '../feedback/schemas/restaurant-feedback.schema';
import { ItemFeedback } from '../feedback/schemas/menu-item-feedback.schema';

// User Story: As an admin, I want to view dashboard statistics so that I can monitor restaurant performance
describe('DashboardService', () => {
  let service: DashboardService;
  let reservationModel: jest.Mocked<Model<Reservation>>;
  let orderModel: jest.Mocked<Model<Order>>;
  let menuItemModel: jest.Mocked<Model<MenuItem>>;
  let restaurantFeedbackModel: jest.Mocked<Model<RestaurantFeedback>>;
  let itemFeedbackModel: jest.Mocked<Model<ItemFeedback>>;

  beforeEach(async () => {
    // Create mock functions for each model
    const mockReservationModel: any = {
      countDocuments: jest.fn(),
      find: jest.fn(),
    };

    const mockOrderModel: any = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    const mockMenuItemModel: any = {
      countDocuments: jest.fn(),
    };

    const mockRestaurantFeedbackModel: any = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
    };

    const mockItemFeedbackModel: any = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(MenuItem.name),
          useValue: mockMenuItemModel,
        },
        {
          provide: getModelToken(RestaurantFeedback.name),
          useValue: mockRestaurantFeedbackModel,
        },
        {
          provide: getModelToken(ItemFeedback.name),
          useValue: mockItemFeedbackModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    reservationModel = module.get(getModelToken(Reservation.name));
    orderModel = module.get(getModelToken(Order.name));
    menuItemModel = module.get(getModelToken(MenuItem.name));
    restaurantFeedbackModel = module.get(
      getModelToken(RestaurantFeedback.name),
    );
    itemFeedbackModel = module.get(getModelToken(ItemFeedback.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecentActivity - TDD Demo', () => {
    it('should return recent activities sorted by date descending', async () => {
      // Arrange
      const mockActivities = [
        {
          type: 'reservation',
          date: new Date('2025-12-10'),
          details: 'Table 5 reserved',
        },
        {
          type: 'order',
          date: new Date('2025-12-09'),
          details: 'Order #123',
        },
        {
          type: 'feedback',
          date: new Date('2025-12-08'),
          details: '5-star rating',
        },
      ];

      const mockReservationModel: any = reservationModel as any;
      const mockOrderModel: any = orderModel as any;
      const mockRestaurantFeedbackModel: any = restaurantFeedbackModel as any;

      mockReservationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: '1',
                tableNumber: 5,
                date: new Date('2025-12-10'),
                createdAt: new Date('2025-12-10'),
              },
            ]),
          }),
        }),
      });

      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: '2',
                totalPrice: 50,
                createdAt: new Date('2025-12-09'),
              },
            ]),
          }),
        }),
      });

      mockRestaurantFeedbackModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: '3',
                rating: 5,
                createdAt: new Date('2025-12-08'),
              },
            ]),
          }),
        }),
      });

      // Act
      // Note: Method is intentionally not implemented yet to demonstrate TDD
      // @ts-expect-error - getRecentActivity does not exist yet
      const result = await (service as any).getRecentActivity();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('reservation');
      expect(result[0].date).toEqual(new Date('2025-12-10'));
      expect(result[1].type).toBe('order');
      expect(result[2].type).toBe('feedback');
      // Verify sorted by date descending
      expect(new Date(result[0].date).getTime()).toBeGreaterThanOrEqual(
        new Date(result[1].date).getTime(),
      );
    });
  });

  // User Story: As an admin, I want to view dashboard statistics so that I can monitor restaurant performance
  describe('getStatistics()', () => {
    describe('Happy Path Scenarios', () => {
      it('should return all statistics correctly with complete data', async () => {
        // Arrange
        const mockReservationCount = 50;
        const mockOrderCount = 30;
        const mockRevenue = 5000;
        const mockTopMenuItems = [
          {
            menuItem: {
              name: 'Pizza Margherita',
              price: 12.99,
              category: 'Main Course',
            },
            orderCount: 25,
          },
          {
            menuItem: {
              name: 'Caesar Salad',
              price: 8.99,
              category: 'Appetizer',
            },
            orderCount: 18,
          },
          {
            menuItem: {
              name: 'Chocolate Cake',
              price: 6.99,
              category: 'Dessert',
            },
            orderCount: 15,
          },
          {
            menuItem: {
              name: 'Burger',
              price: 10.99,
              category: 'Main Course',
            },
            orderCount: 12,
          },
          {
            menuItem: {
              name: 'Pasta Carbonara',
              price: 11.99,
              category: 'Main Course',
            },
            orderCount: 10,
          },
        ];
        const mockRestaurantFeedbackCount = 20;
        const mockItemFeedbackCount = 15;
        const mockRestaurantRating = 4.5;
        const mockItemRating = 4.0;
        const mockPendingRestaurantFeedback = 5;
        const mockPendingItemFeedback = 3;
        const mockRepliedRestaurantFeedback = 15;
        const mockRepliedItemFeedback = 12;

        reservationModel.countDocuments.mockResolvedValue(mockReservationCount);
        orderModel.countDocuments.mockResolvedValue(mockOrderCount);
        orderModel.aggregate
          .mockResolvedValueOnce([{ totalRevenue: mockRevenue }])
          .mockResolvedValueOnce(mockTopMenuItems);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(mockRestaurantFeedbackCount)
          .mockResolvedValueOnce(mockPendingRestaurantFeedback)
          .mockResolvedValueOnce(mockRepliedRestaurantFeedback);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(mockItemFeedbackCount)
          .mockResolvedValueOnce(mockPendingItemFeedback)
          .mockResolvedValueOnce(mockRepliedItemFeedback);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: mockRestaurantRating, count: mockRestaurantFeedbackCount },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: mockItemRating, count: mockItemFeedbackCount },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result).toBeDefined();
        expect(result.totalReservations).toBe(mockReservationCount);
        expect(result.totalOrders).toBe(mockOrderCount);
        expect(result.totalRevenue).toBe(mockRevenue);
        expect(result.topMenuItems).toEqual(mockTopMenuItems);
        expect(result.topMenuItems.length).toBe(5);
        expect(result.feedbackSummary.totalFeedback).toBe(
          mockRestaurantFeedbackCount + mockItemFeedbackCount,
        );
        expect(result.feedbackSummary.restaurantFeedback).toBe(
          mockRestaurantFeedbackCount,
        );
        expect(result.feedbackSummary.itemFeedback).toBe(mockItemFeedbackCount);
        expect(result.feedbackSummary.pendingFeedback).toBe(
          mockPendingRestaurantFeedback + mockPendingItemFeedback,
        );
        expect(result.feedbackSummary.repliedFeedback).toBe(
          mockRepliedRestaurantFeedback + mockRepliedItemFeedback,
        );

        // Calculate expected weighted average: (4.5*20 + 4.0*15) / 35 = 4.2857... rounded to 4.3
        const expectedAverage =
          Math.round(
            ((mockRestaurantRating * mockRestaurantFeedbackCount +
              mockItemRating * mockItemFeedbackCount) /
              (mockRestaurantFeedbackCount + mockItemFeedbackCount)) *
              10,
          ) / 10;
        expect(result.feedbackSummary.averageRating).toBe(expectedAverage);

        // Verify all mocks were called
        expect(reservationModel.countDocuments).toHaveBeenCalledTimes(1);
        expect(orderModel.countDocuments).toHaveBeenCalledTimes(1);
        expect(orderModel.aggregate).toHaveBeenCalledTimes(2);
        expect(restaurantFeedbackModel.countDocuments).toHaveBeenCalledTimes(3);
        expect(itemFeedbackModel.countDocuments).toHaveBeenCalledTimes(3);
        expect(restaurantFeedbackModel.aggregate).toHaveBeenCalledTimes(1);
        expect(itemFeedbackModel.aggregate).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge Cases - Zero Data', () => {
      it('should handle zero data and return zeros', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.totalReservations).toBe(0);
        expect(result.totalOrders).toBe(0);
        expect(result.totalRevenue).toBe(0);
        expect(result.topMenuItems).toEqual([]);
        expect(result.feedbackSummary.totalFeedback).toBe(0);
        expect(result.feedbackSummary.averageRating).toBe(0);
        expect(result.feedbackSummary.pendingFeedback).toBe(0);
        expect(result.feedbackSummary.repliedFeedback).toBe(0);
        expect(result.feedbackSummary.restaurantFeedback).toBe(0);
        expect(result.feedbackSummary.itemFeedback).toBe(0);
      });
    });

    describe('Edge Cases - Partial Data', () => {
      it('should handle when reservations exist but orders do not', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(10);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.totalReservations).toBe(10);
        expect(result.totalOrders).toBe(0);
        expect(result.totalRevenue).toBe(0);
        expect(result.topMenuItems).toEqual([]);
      });

      it('should handle when feedback exists but ratings do not', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(5);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(3);
        // Empty rating aggregations
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.totalFeedback).toBe(15);
        expect(result.feedbackSummary.averageRating).toBe(0);
      });
    });

    describe('Edge Cases - Empty Aggregations', () => {
      it('should handle empty revenue aggregation result', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(5);
        orderModel.aggregate
          .mockResolvedValueOnce([]) // Empty revenue result
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.totalRevenue).toBe(0);
        expect(orderModel.aggregate).toHaveBeenCalled();
      });

      it('should handle empty top menu items aggregation', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]); // Empty top items
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.topMenuItems).toEqual([]);
      });

      it('should handle empty rating aggregation with count = 0', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        // Aggregation returns result but count is 0
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 5, count: 0 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4, count: 0 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.averageRating).toBe(0);
      });
    });

    describe('Edge Cases - Rating Calculations', () => {
      it('should calculate weighted average rating correctly', async () => {
        // Arrange
        const restaurantCount = 10;
        const restaurantRating = 4.5;
        const itemCount = 20;
        const itemRating = 3.5;

        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(restaurantCount)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(itemCount)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: restaurantRating, count: restaurantCount },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: itemRating, count: itemCount },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        // Expected: (4.5*10 + 3.5*20) / 30 = (45 + 70) / 30 = 115/30 = 3.833... rounded to 3.8
        const expectedAverage =
          Math.round(
            ((restaurantRating * restaurantCount + itemRating * itemCount) /
              (restaurantCount + itemCount)) *
              10,
          ) / 10;
        expect(result.feedbackSummary.averageRating).toBe(expectedAverage);
        expect(result.feedbackSummary.averageRating).toBe(3.8);
      });

      it('should round average rating to 1 decimal place', async () => {
        // Arrange
        const restaurantCount = 7;
        const restaurantRating = 4.567;
        const itemCount = 3;
        const itemRating = 4.333;

        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(restaurantCount)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(itemCount)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: restaurantRating, count: restaurantCount },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: itemRating, count: itemCount },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        // Raw calculation: (4.567*7 + 4.333*3) / 10 = (31.969 + 12.999) / 10 = 4.4968
        // Rounded to 1 decimal: 4.5
        expect(result.feedbackSummary.averageRating).toBe(4.5);
      });

      it('should handle zero total feedback when calculating average rating', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.totalFeedback).toBe(0);
        expect(result.feedbackSummary.averageRating).toBe(0);
      });
    });

    describe('Error Handling', () => {
      it('should throw error when reservationModel.countDocuments fails', async () => {
        // Arrange
        const error = new Error('Database connection failed');
        reservationModel.countDocuments.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
        expect(reservationModel.countDocuments).toHaveBeenCalled();
      });

      it('should throw error when orderModel.countDocuments fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        const error = new Error('Database query failed');
        orderModel.countDocuments.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });

      it('should throw error when orderModel.aggregate fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        const error = new Error('Aggregation pipeline failed');
        orderModel.aggregate.mockRejectedValueOnce(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });

      it('should throw error when restaurantFeedbackModel.countDocuments fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        const error = new Error('Feedback query failed');
        restaurantFeedbackModel.countDocuments.mockRejectedValueOnce(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });

      it('should throw error when restaurantFeedbackModel.aggregate fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        const error = new Error('Rating aggregation failed');
        restaurantFeedbackModel.aggregate.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });

      it('should throw error when itemFeedbackModel.countDocuments fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        const error = new Error('Item feedback query failed');
        itemFeedbackModel.countDocuments.mockRejectedValueOnce(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });

      it('should throw error when itemFeedbackModel.aggregate fails', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        const error = new Error('Item rating aggregation failed');
        itemFeedbackModel.aggregate.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getStatistics()).rejects.toThrow(error);
      });
    });

    describe('Edge Cases - Status Filters', () => {
      it('should correctly count pending and replied feedback with status filters', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(20)
          .mockResolvedValueOnce(8) // pending
          .mockResolvedValueOnce(12); // replied
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(15)
          .mockResolvedValueOnce(5) // pending
          .mockResolvedValueOnce(10); // replied
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.5, count: 20 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.0, count: 15 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.pendingFeedback).toBe(13); // 8 + 5
        expect(result.feedbackSummary.repliedFeedback).toBe(22); // 12 + 10

        // Verify status filters were used
        expect(restaurantFeedbackModel.countDocuments).toHaveBeenCalledWith({
          status: 'pending',
        });
        expect(restaurantFeedbackModel.countDocuments).toHaveBeenCalledWith({
          status: 'replied',
        });
        expect(itemFeedbackModel.countDocuments).toHaveBeenCalledWith({
          status: 'pending',
        });
        expect(itemFeedbackModel.countDocuments).toHaveBeenCalledWith({
          status: 'replied',
        });
      });
    });

    describe('Edge Cases - Top Menu Items Structure', () => {
      it('should handle top menu items with partial data correctly', async () => {
        // Arrange
        const mockTopMenuItems = [
          {
            menuItem: {
              name: 'Pizza',
              price: 12.99,
              category: 'Main Course',
            },
            orderCount: 25,
          },
          {
            menuItem: {
              name: 'Salad',
              price: 8.99,
              category: 'Appetizer',
            },
            orderCount: 18,
          },
        ];

        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce(mockTopMenuItems);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.topMenuItems).toEqual(mockTopMenuItems);
        expect(result.topMenuItems.length).toBe(2);
        expect(result.topMenuItems[0].menuItem.name).toBe('Pizza');
        expect(result.topMenuItems[0].orderCount).toBe(25);
      });
    });

    describe('Edge Cases - Revenue Calculation Branch Coverage', () => {
      it('should handle revenue calculation when revenueResult has data', async () => {
        // Arrange - Test the true branch of revenueResult.length > 0
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(5);
        orderModel.aggregate
          .mockResolvedValueOnce([{ totalRevenue: 1500.75 }]) // Has revenue data
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.totalRevenue).toBe(1500.75);
        expect(orderModel.aggregate).toHaveBeenCalledTimes(2);
      });
    });

    describe('Edge Cases - Rating Calculation Branch Coverage', () => {
      it('should handle restaurant rating when result has data and count > 0', async () => {
        // Arrange - Test the true branch of restaurantRatingResult conditional
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        // Result has data AND count > 0 - tests true branch
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.7, count: 10 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.restaurantFeedback).toBe(10);
        expect(result.feedbackSummary.averageRating).toBe(4.7); // Only restaurant rating since item is 0
      });

      it('should handle item rating when result has data and count > 0', async () => {
        // Arrange - Test the true branch of itemRatingResult conditional
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(15)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        // Result has data AND count > 0 - tests true branch
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 3.9, count: 15 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.itemFeedback).toBe(15);
        expect(result.feedbackSummary.averageRating).toBe(3.9); // Only item rating since restaurant is 0
      });

      it('should handle overall rating calculation when totalFeedback > 0', async () => {
        // Arrange - Test the true branch of overallAverageRating conditional
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(8)
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(6);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(12)
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(9);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.5, count: 8 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.0, count: 12 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        // Expected: (4.5*8 + 4.0*12) / 20 = (36 + 48) / 20 = 84/20 = 4.2
        expect(result.feedbackSummary.totalFeedback).toBe(20);
        expect(result.feedbackSummary.averageRating).toBe(4.2);
        expect(result.feedbackSummary.pendingFeedback).toBe(5); // 2 + 3
        expect(result.feedbackSummary.repliedFeedback).toBe(15); // 6 + 9
      });

      it('should handle rating when result has data but count is 0', async () => {
        // Arrange - Test the false branch when count = 0
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        // Result exists but count is 0 - tests false branch
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 5.0, count: 0 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.0, count: 0 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.averageRating).toBe(0);
      });

      it('should handle rating when result length is 0', async () => {
        // Arrange - Test the false branch when result.length = 0
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        // Empty result arrays - tests false branch
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.totalFeedback).toBe(8);
        expect(result.feedbackSummary.averageRating).toBe(0);
      });
    });

    describe('Edge Cases - Complete Coverage Scenarios', () => {
      it('should handle all feedback calculations with mixed data', async () => {
        // Arrange - Comprehensive scenario covering all code paths
        reservationModel.countDocuments.mockResolvedValue(25);
        orderModel.countDocuments.mockResolvedValue(15);
        orderModel.aggregate
          .mockResolvedValueOnce([{ totalRevenue: 2500.50 }])
          .mockResolvedValueOnce([
            {
              menuItem: { name: 'Pizza', price: 12.99, category: 'Main' },
              orderCount: 10,
            },
          ]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(20)
          .mockResolvedValueOnce(8)
          .mockResolvedValueOnce(12);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(15)
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(10);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.6, count: 20 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.2, count: 15 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert - Verify all paths were executed
        expect(result.totalReservations).toBe(25);
        expect(result.totalOrders).toBe(15);
        expect(result.totalRevenue).toBe(2500.50);
        expect(result.topMenuItems.length).toBe(1);
        expect(result.feedbackSummary.totalFeedback).toBe(35);
        expect(result.feedbackSummary.restaurantFeedback).toBe(20);
        expect(result.feedbackSummary.itemFeedback).toBe(15);
        expect(result.feedbackSummary.pendingFeedback).toBe(13); // 8 + 5
        expect(result.feedbackSummary.repliedFeedback).toBe(22); // 12 + 10
        // Weighted average: (4.6*20 + 4.2*15) / 35 = (92 + 63) / 35 = 155/35 = 4.428... = 4.4
        expect(result.feedbackSummary.averageRating).toBe(4.4);
      });

      it('should handle scenario with only restaurant feedback', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(10)
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(7);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        restaurantFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 4.8, count: 10 },
        ]);
        itemFeedbackModel.aggregate.mockResolvedValue([]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.totalFeedback).toBe(10);
        expect(result.feedbackSummary.restaurantFeedback).toBe(10);
        expect(result.feedbackSummary.itemFeedback).toBe(0);
        expect(result.feedbackSummary.averageRating).toBe(4.8);
        expect(result.feedbackSummary.pendingFeedback).toBe(3);
        expect(result.feedbackSummary.repliedFeedback).toBe(7);
      });

      it('should handle scenario with only item feedback', async () => {
        // Arrange
        reservationModel.countDocuments.mockResolvedValue(0);
        orderModel.countDocuments.mockResolvedValue(0);
        orderModel.aggregate
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]);
        restaurantFeedbackModel.countDocuments
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0);
        itemFeedbackModel.countDocuments
          .mockResolvedValueOnce(12)
          .mockResolvedValueOnce(4)
          .mockResolvedValueOnce(8);
        restaurantFeedbackModel.aggregate.mockResolvedValue([]);
        itemFeedbackModel.aggregate.mockResolvedValue([
          { averageRating: 3.9, count: 12 },
        ]);

        // Act
        const result = await service.getStatistics();

        // Assert
        expect(result.feedbackSummary.totalFeedback).toBe(12);
        expect(result.feedbackSummary.restaurantFeedback).toBe(0);
        expect(result.feedbackSummary.itemFeedback).toBe(12);
        expect(result.feedbackSummary.averageRating).toBe(3.9);
        expect(result.feedbackSummary.pendingFeedback).toBe(4);
        expect(result.feedbackSummary.repliedFeedback).toBe(8);
      });
    });
  });
});

