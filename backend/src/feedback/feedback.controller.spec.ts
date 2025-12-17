import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController (Unit)', () => {
  let controller: FeedbackController;
  let service: jest.Mocked<FeedbackService>;

  const mockFeedbackService = {
    createRestaurantFeedback: jest.fn(),
    getAllRestaurantFeedbacks: jest.fn(),
    replyRestaurantFeedback: jest.fn(),
    getRestaurantAverageRating: jest.fn(),
    getRestaurantFeedbackCount: jest.fn(),
    getRestaurantFeedbackStats: jest.fn(),
    getRecentRestaurantFeedbacks: jest.fn(),
    getRestaurantFeedbackSorted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('createRestaurantFeedback', () => {
    it('should call service with logged-in userId, message, and rating', async () => {
      // Arrange
      const req = {
        user: {
          id: '6928f77b243ef56d644c9113',
        },
      };
  
      const message = 'Great food and excellent service!';
      const rating = 5;
  
      const mockResponse = {
        userId: req.user.id,
        message,
        rating,
        date: new Date(),
        adminId: null,
        reply: null,
        replyDate: null,
        status: 'pending',
        _id: '6941e4e0f3d155fdf0bb03c0',
        __v: 0,
      };
  
      service.createRestaurantFeedback.mockResolvedValue(mockResponse as any);
  
      // Act
      const result = await controller.createRestaurantFeedback(
        message,
        rating,
        req as any,
      );
  
      // Assert
      expect(service.createRestaurantFeedback).toHaveBeenCalledWith(
        req.user.id,
        message,
        rating,
      );
  
      expect(result).toEqual(mockResponse);
    });
  });
  
  describe('getAllRestaurantFeedbacks', () => {
    it('should return all restaurant feedbacks', async () => {
      // Arrange
      const mockFeedbacks = [
        {
          _id: '1',
          userId: {
            _id: 'user1',
            name: 'ramez',
            email: 'ramez@gmail.com',
            role: 'admin',
          },
          message: 'Great food and excellent service!',
          rating: 5,
          date: new Date(),
          adminId: null,
          reply: null,
          replyDate: null,
          status: 'pending',
          __v: 0,
        },
        {
          _id: '2',
          userId: {
            _id: 'user2',
            name: 'testuser',
            email: 'test@example.com',
            role: 'customer',
          },
          message: 'The food was amazing!',
          rating: 5,
          date: new Date(),
          adminId: null,
          reply: null,
          replyDate: null,
          status: 'pending',
          __v: 0,
        },
      ];
  
      service.getAllRestaurantFeedbacks.mockResolvedValue(
        mockFeedbacks as any,
      );
  
      // Act
      const result = await controller.getAllRestaurantFeedbacks();
  
      // Assert
      expect(service.getAllRestaurantFeedbacks).toHaveBeenCalled();
      expect(result).toEqual(mockFeedbacks);
    });
  });
  

  describe('replyRestaurantFeedback', () => {
    it('should call service with feedbackId, adminId, and reply message', async () => {
      // Arrange
      const req = {
        user: { id: '6928f77b243ef56d644c9113' }, // logged-in admin
      };
  
      const feedbackId = '69251bcccb359fb446a42a9e';
      const replyMessage =
        "Thank you for your feedback! We're glad you enjoyed your visit.";
  
      const mockResponse = {
        _id: feedbackId,
        userId: '69250b3e4bc2a60b6d697f26',
        message: 'good',
        rating: 4,
        date: new Date(),
        adminId: req.user.id,
        reply: replyMessage,
        replyDate: new Date(),
        status: 'replied',
        __v: 0,
      };
  
      service.replyRestaurantFeedback.mockResolvedValue(mockResponse as any);
  
      // Act
      const result = await controller.replyRestaurantFeedback(
        feedbackId,
        replyMessage,
        req as any,
      );
  
      // Assert
      expect(service.replyRestaurantFeedback).toHaveBeenCalledWith(
        feedbackId,
        req.user.id,
        replyMessage,
      );
      expect(result).toEqual(mockResponse);
    });
  });
  

  describe('getRestaurantAverageRating', () => {
    it('should return the average rating from the service', async () => {
      // Arrange
      const mockAverageRating = 4;
      service.getRestaurantAverageRating.mockResolvedValue(mockAverageRating);
  
      // Act
      const result = await controller.getRestaurantAverageRating();
  
      // Assert
      expect(service.getRestaurantAverageRating).toHaveBeenCalled();
      expect(result).toBe(mockAverageRating);
    });
  });
  

  describe('getRestaurantFeedbackCount', () => {
    it('should return the number of restaurant feedbacks from the service', async () => {
      // Arrange
      const mockCount = 12;
      service.getRestaurantFeedbackCount.mockResolvedValue(mockCount);
  
      // Act
      const result = await controller.getRestaurantFeedbackCount();
  
      // Assert
      expect(service.getRestaurantFeedbackCount).toHaveBeenCalled();
      expect(result).toBe(mockCount);
    });
  });
  


  describe('getRestaurantFeedbackStats', () => {
    it('should return restaurant feedback stats from the service', async () => {
      // Arrange
      const mockStats = {
        totalFeedbacks: 11,
        pendingCount: 2,
        repliedCount: 9,
        averageRating: 3.5,
      };
      service.getRestaurantFeedbackStats.mockResolvedValue(mockStats);
  
      // Act
      const result = await controller.getRestaurantFeedbackStats();
  
      // Assert
      expect(service.getRestaurantFeedbackStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
  
  describe('getRecentRestaurantFeedbacks', () => {
    it('should return the most recent restaurant feedbacks from the service', async () => {
      // Arrange
      const mockRecentFeedbacks = [
        {
          username: 'ramez',
          rating: 5,
          message: 'Great food and excellent service!',
          date: new Date('2025-12-16T23:01:52.643Z'),
        },
        {
          username: 'ramez',
          rating: 5,
          message: 'fagerr',
          date: new Date('2025-12-16T15:40:14.079Z'),
        },
        {
          username: 'ramez',
          rating: 5,
          message: 'mmmmm',
          date: new Date('2025-12-10T11:56:51.953Z'),
        },
        {
          username: 'Kirolos',
          rating: 1,
          message: "<script>alert('hello from hacker')</script>",
          date: new Date('2025-12-03T17:03:52.404Z'),
        },
        {
          username: 'ramez',
          rating: 4,
          message: 'eshataaaa',
          date: new Date('2025-11-29T12:44:42.770Z'),
        },
      ];
      service.getRecentRestaurantFeedbacks.mockResolvedValue(mockRecentFeedbacks);
  
      // Act
      const result = await controller.getRecentRestaurantFeedbacks();
  
      // Assert
      expect(service.getRecentRestaurantFeedbacks).toHaveBeenCalled();
      expect(result).toEqual(mockRecentFeedbacks);
    });
  });
  
 
     
  describe('getRestaurantFeedbackSorted', () => {
    it('should return sorted restaurant feedbacks from the service', async () => {
      const mockSortedFeedbacks = [
        {
          _id: '6941e4e0f3d155fdf0bb03c0',
          userId: { _id: '6928f77b243ef56d644c9113', name: 'ramez', email: 'ramezmilad19@gmail.com' },
          message: 'Great food and excellent service!',
          rating: 5,
          date: new Date('2025-12-16T23:01:52.643Z'),
          adminId: null,
          reply: null,
          replyDate: null,
          status: 'pending',
          __v: 0,
        },
        {
            _id: '69417d5ef3d155fdf0bb0352',
            userId: { _id: '6928f77b243ef56d644c9113', name: 'ramez', email: 'ramezmilad19@gmail.com' },
            message: 'fagerr',
            rating: 5,
            date: new Date('2025-12-16T15:40:14.079Z'),
            adminId: { _id: '6928f77b243ef56d644c9113', name: 'ramez', email: 'ramezmilad19@gmail.com' },
            reply: '..',
            replyDate: new Date('2025-12-16T15:40:35.867Z'),
            status: 'replied',
            __v: 0,
          },
      ];
  
      service.getRestaurantFeedbackSorted.mockResolvedValue(mockSortedFeedbacks as any);
  
      const result = await controller.getRestaurantFeedbackSorted();
  
      expect(service.getRestaurantFeedbackSorted).toHaveBeenCalled();
      expect(result).toEqual(mockSortedFeedbacks);
    });
  });
  
});
