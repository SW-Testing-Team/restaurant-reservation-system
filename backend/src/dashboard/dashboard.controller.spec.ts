import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// User Story: As an admin, I want dashboard access to be restricted so that sensitive data is protected
describe('DashboardController (Integration)', () => {
  let app: INestApplication<App>;
  let dashboardService: jest.Mocked<DashboardService>;

  // Mock implementations for guards that read from custom header and set user
  // JwtAuthGuard should throw 401 when authentication fails
  const mockJwtAuthGuard: CanActivate = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // Read user from custom header set by tests
      const userHeader = req.headers['x-test-user'];
      if (userHeader) {
        try {
          req.user = JSON.parse(userHeader);
          return true;
        } catch {
          // Invalid user header = unauthenticated
          throw new UnauthorizedException();
        }
      }
      // No user header = unauthenticated - throw 401
      throw new UnauthorizedException();
    }),
  };

  // RolesGuard should throw 403 when authorization fails (user authenticated but wrong role)
  const mockRolesGuard: CanActivate = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // If no user, this shouldn't happen if JwtAuthGuard worked correctly
      // But we check anyway for safety
      if (!req.user) {
        throw new UnauthorizedException();
      }
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        throw new ForbiddenException();
      }
      return true;
    }),
  };

  // Create mock dashboard service
  const createMockDashboardService = () => ({
    getStatistics: jest.fn(),
    getRecentActivity: jest.fn(),
  });

  beforeEach(async () => {
    dashboardService = createMockDashboardService() as unknown as jest.Mocked<DashboardService>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  // User Story: As an admin, I want dashboard access to be restricted so that sensitive data is protected
  describe('GET /dashboard/stats', () => {
    describe('Successful Responses', () => {
      it('should return statistics with mock data for admin user', async () => {
        // Arrange
        const mockStats = {
          totalReservations: 50,
          totalOrders: 30,
          totalRevenue: 5000,
          topMenuItems: [
            {
              menuItem: {
                name: 'Pizza Margherita',
                price: 12.99,
                category: 'Main Course',
              },
              orderCount: 25,
            },
          ],
          feedbackSummary: {
            totalFeedback: 35,
            averageRating: 4.3,
            pendingFeedback: 8,
            repliedFeedback: 27,
            restaurantFeedback: 20,
            itemFeedback: 15,
          },
        };

        dashboardService.getStatistics.mockResolvedValue(mockStats);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(200);

        // Assert
        expect(response.body).toEqual(mockStats);
        expect(dashboardService.getStatistics).toHaveBeenCalledTimes(1);
        expect(dashboardService.getStatistics).toHaveBeenCalledWith();
      });

      it('should return empty statistics when no data exists', async () => {
        // Arrange
        const emptyStats = {
          totalReservations: 0,
          totalOrders: 0,
          totalRevenue: 0,
          topMenuItems: [],
          feedbackSummary: {
            totalFeedback: 0,
            averageRating: 0,
            pendingFeedback: 0,
            repliedFeedback: 0,
            restaurantFeedback: 0,
            itemFeedback: 0,
          },
        };

        dashboardService.getStatistics.mockResolvedValue(emptyStats);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(200);

        // Assert
        expect(response.body).toEqual(emptyStats);
        expect(response.body.totalReservations).toBe(0);
        expect(response.body.totalOrders).toBe(0);
        expect(response.body.totalRevenue).toBe(0);
        expect(response.body.topMenuItems).toEqual([]);
        expect(dashboardService.getStatistics).toHaveBeenCalledTimes(1);
      });
    });

    describe('Service Error Handling', () => {
      it('should return 500 when service throws an error', async () => {
        // Arrange
        const errorMessage = 'Database connection failed';
        dashboardService.getStatistics.mockRejectedValue(
          new Error(errorMessage),
        );

        // Act & Assert
        await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(500);

        expect(dashboardService.getStatistics).toHaveBeenCalledTimes(1);
      });

      it('should handle service returning null gracefully', async () => {
        // Arrange
        dashboardService.getStatistics.mockResolvedValue(null as any);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(200);

        // Assert
        // NestJS/Express serializes null as empty object {} in JSON responses
        expect(response.body).toEqual({});
        expect(dashboardService.getStatistics).toHaveBeenCalledTimes(1);
      });
    });

    describe('Authorization - Admin Access', () => {
      it('should allow access for admin user', async () => {
        // Arrange
        const mockStats = {
          totalReservations: 10,
          totalOrders: 5,
          totalRevenue: 1000,
          topMenuItems: [],
          feedbackSummary: {
            totalFeedback: 10,
            averageRating: 4.0,
            pendingFeedback: 2,
            repliedFeedback: 8,
            restaurantFeedback: 5,
            itemFeedback: 5,
          },
        };

        dashboardService.getStatistics.mockResolvedValue(mockStats);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(200);

        // Assert
        expect(response.body).toEqual(mockStats);
        expect(dashboardService.getStatistics).toHaveBeenCalledTimes(1);
      });
    });

    describe('Authorization - Customer Access Denied', () => {
      it('should deny access for customer user (403 Forbidden)', async () => {
        // Arrange
        dashboardService.getStatistics.mockResolvedValue({} as any);

        // Act & Assert
        await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '2', role: 'customer', email: 'customer@test.com' }))
          .expect(403);

        // Service should not be called when authorization fails
        expect(dashboardService.getStatistics).not.toHaveBeenCalled();
      });
    });

    describe('Authorization - Unauthenticated Access Denied', () => {
      it('should deny access for unauthenticated user (401 Unauthorized)', async () => {
        // Arrange
        dashboardService.getStatistics.mockResolvedValue({} as any);

        // Act & Assert
        await request(app.getHttpServer())
          .get('/dashboard/stats')
          .expect(401);

        // Service should not be called when authentication fails
        expect(dashboardService.getStatistics).not.toHaveBeenCalled();
      });

      it('should deny access when user object is missing', async () => {
        // Arrange
        dashboardService.getStatistics.mockResolvedValue({} as any);

        // Act & Assert
        await request(app.getHttpServer())
          .get('/dashboard/stats')
          .expect(401);

        expect(dashboardService.getStatistics).not.toHaveBeenCalled();
      });
    });

    describe('Request Validation', () => {
      it('should handle request correctly with proper headers', async () => {
        // Arrange
        const mockStats = {
          totalReservations: 1,
          totalOrders: 1,
          totalRevenue: 100,
          topMenuItems: [],
          feedbackSummary: {
            totalFeedback: 1,
            averageRating: 4.5,
            pendingFeedback: 0,
            repliedFeedback: 1,
            restaurantFeedback: 1,
            itemFeedback: 0,
          },
        };

        dashboardService.getStatistics.mockResolvedValue(mockStats);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .set('Content-Type', 'application/json')
          .expect(200);

        // Assert
        expect(response.body).toEqual(mockStats);
        expect(response.headers['content-type']).toMatch(/json/);
      });

      it('should return JSON response format', async () => {
        // Arrange
        const mockStats = {
          totalReservations: 5,
          totalOrders: 3,
          totalRevenue: 500,
          topMenuItems: [],
          feedbackSummary: {
            totalFeedback: 5,
            averageRating: 4.0,
            pendingFeedback: 1,
            repliedFeedback: 4,
            restaurantFeedback: 3,
            itemFeedback: 2,
          },
        };

        dashboardService.getStatistics.mockResolvedValue(mockStats);

        // Act
        const response = await request(app.getHttpServer())
          .get('/dashboard/stats')
          .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
          .expect(200);

        // Assert
        expect(response.type).toMatch(/json/);
        expect(typeof response.body).toBe('object');
        expect(response.body).toHaveProperty('totalReservations');
        expect(response.body).toHaveProperty('totalOrders');
        expect(response.body).toHaveProperty('totalRevenue');
        expect(response.body).toHaveProperty('topMenuItems');
        expect(response.body).toHaveProperty('feedbackSummary');
      });
    });
  });

  describe('GET /dashboard/recent-activity - TDD Demo', () => {
    it('should return recent activities', async () => {
      // Arrange
      const now = new Date().toISOString();
      const mockActivities = [
        { type: 'reservation', date: now, details: 'Table 5' },
        { type: 'order', date: now, details: 'Order #123' },
      ];

      dashboardService.getRecentActivity.mockResolvedValue(mockActivities);

      // Act
      const response = await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Authorization', 'Bearer mock-admin-token')
        .set('x-test-user', JSON.stringify({ id: '1', role: 'admin', email: 'admin@test.com' }))
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockActivities);
      expect(dashboardService.getRecentActivity).toHaveBeenCalledTimes(1);
    });
  });
});

