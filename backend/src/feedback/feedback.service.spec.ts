import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FeedbackService } from '../feedback/feedback.service';
import { RestaurantFeedback } from '../feedback/schemas/restaurant-feedback.schema';

// Mock class for RestaurantFeedback model
class MockRestaurantFeedback {
  constructor(private data: any) {}

  save = jest.fn().mockImplementation(() => this.data);

  // Add static mocks for Mongoose static methods
  static find = jest.fn();
  static findByIdAndUpdate: jest.Mock; // declare the type so TS knows it exists
  static aggregate: jest.Mock;
  static countDocuments: jest.Mock;

}

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getModelToken(RestaurantFeedback.name),
          useValue: MockRestaurantFeedback,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRestaurantFeedback', () => {
    it('should create and return a restaurant feedback', async () => {
      const userId = '123';
      const message = 'Great restaurant!';
      const rating = 5;

      const result = await service.createRestaurantFeedback(userId, message, rating);

      expect(result).toEqual({
        userId,
        message,
        rating,
        date: expect.any(Date),
        reply: null,
        replyDate: null,
        status: 'pending',
      });
    });
  });

  describe('getAllRestaurantFeedbacks', () => {
    it('should return all restaurant feedbacks with populated user and admin', async () => {
      const mockFeedbacks = [
        {
          _id: '1',
          userId: { _id: 'user1', name: 'Alice', email: 'alice@mail.com', role: 'user', phone: '1234' },
          adminId: { _id: 'admin1', name: 'Bob', email: 'bob@mail.com', role: 'admin', phone: '5678' },
          message: 'Great service!',
          rating: 5,
          date: new Date(),
          reply: 'Thank you!',
          replyDate: new Date(),
          status: 'replied',
        },
      ];

      // Mock the Mongoose chain
      const execMock = jest.fn().mockResolvedValueOnce(mockFeedbacks);
      const populateAdminMock = jest.fn(() => ({ exec: execMock }));
      const populateUserMock = jest.fn(() => ({ populate: populateAdminMock }));
      const sortMock = jest.fn(() => ({ populate: populateUserMock }));
      MockRestaurantFeedback.find.mockReturnValueOnce({ sort: sortMock });

      const result = await service.getAllRestaurantFeedbacks();

      expect(MockRestaurantFeedback.find).toHaveBeenCalled();
      expect(result).toEqual(mockFeedbacks);
    });
  });


  describe('replyRestaurantFeedback', () => {
    it('should update a feedback with admin reply and return it', async () => {
      const feedbackId = 'feedback1';
      const adminId = 'admin1';
      const replyMessage = 'Thank you for your feedback!';
  
      // Mock the updated feedback returned by Mongoose
      const updatedFeedback = {
        _id: feedbackId,
        userId: 'user1',
        message: 'Great service!',
        rating: 5,
        date: new Date(),
        reply: replyMessage,
        replyDate: expect.any(Date),
        status: 'replied',
        adminId,
      };
  
      // Mock the findByIdAndUpdate function
      MockRestaurantFeedback.findByIdAndUpdate = jest
        .fn()
        .mockResolvedValueOnce(updatedFeedback);
  
      // Call the service function
      const result = await service.replyRestaurantFeedback(
        feedbackId,
        adminId,
        replyMessage,
      );
  
      // Assertions
      expect(MockRestaurantFeedback.findByIdAndUpdate).toHaveBeenCalledWith(
        feedbackId,
        {
          reply: replyMessage,
          replyDate: expect.any(Date),
          status: 'replied',
          adminId,
        },
        { new: true },
      );
      expect(result).toEqual(updatedFeedback);
    });
  
    it('should throw an error if feedback not found', async () => {
      const feedbackId = 'nonexistent';
      const adminId = 'admin1';
      const replyMessage = 'Thanks!';
  
      MockRestaurantFeedback.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
  
      await expect(
        service.replyRestaurantFeedback(feedbackId, adminId, replyMessage),
      ).rejects.toThrow('Feedback not found');
    });
  });


  describe('getRestaurantAverageRating', () => {
    it('should return the average rating of all restaurant feedbacks', async () => {
      const mockAverage = [{ _id: null, averageRating: 4.5 }];
  
      // Mock the aggregate method
      MockRestaurantFeedback.aggregate = jest.fn().mockResolvedValueOnce(mockAverage);
  
      const result = await service.getRestaurantAverageRating();
  
      expect(MockRestaurantFeedback.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
          },
        },
      ]);
      expect(result).toBe(4.5);
    });
  });
  

  describe('getRestaurantFeedbackCount', () => {
    it('should return the number of restaurant feedbacks', async () => {
      const mockCount = 10;
  
      // Mock the Mongoose chain: countDocuments().exec()
      const execMock = jest.fn().mockResolvedValueOnce(mockCount);
      MockRestaurantFeedback.countDocuments = jest.fn(() => ({ exec: execMock }));
  
      const result = await service.getRestaurantFeedbackCount();
  
      expect(MockRestaurantFeedback.countDocuments).toHaveBeenCalled();
      expect(result).toBe(mockCount);
    });
  });

  
  describe('getRestaurantFeedbackStats', () => {
    it('should return correct stats for restaurant feedbacks', async () => {
      // Mock values
      const mockTotal = 20;
      const mockPending = 5;
      const mockReplied = 10;
      const mockAverageRating = 4.3;
  
      // Mock countDocuments().exec() for total, pending, replied
      const execMockTotal = jest.fn().mockResolvedValueOnce(mockTotal);
      const execMockPending = jest.fn().mockResolvedValueOnce(mockPending);
      const execMockReplied = jest.fn().mockResolvedValueOnce(mockReplied);
  
      // Mock the restaurantFeedback model
      MockRestaurantFeedback.countDocuments = jest
        .fn()
        .mockImplementationOnce(() => ({ exec: execMockTotal }))
        .mockImplementationOnce(() => ({ exec: execMockPending }))
        .mockImplementationOnce(() => ({ exec: execMockReplied }));
  
      // Mock getRestaurantAverageRating
      service.getRestaurantAverageRating = jest.fn().mockResolvedValueOnce(mockAverageRating);
  
      // Call the service method
      const result = await service.getRestaurantFeedbackStats();
  
      // Check that countDocuments was called correctly
      expect(MockRestaurantFeedback.countDocuments).toHaveBeenCalledTimes(3);
      expect(service.getRestaurantAverageRating).toHaveBeenCalled();
  
      // Check the returned stats
      expect(result).toEqual({
        totalFeedbacks: mockTotal,
        pendingCount: mockPending,
        repliedCount: mockReplied,
        averageRating: mockAverageRating,
      });
    });
  });
  
  describe('getRecentRestaurantFeedbacks', () => {
    it('should return the 5 most recent feedbacks with username, rating, message, and date', async () => {
      // Mock database feedbacks
      const mockFeedbacksFromDb = [
        {
          userId: { _id: 'user1', name: 'Alice' },
          rating: 5,
          message: 'Great!',
          date: new Date('2025-01-01'),
        },
        {
          userId: { _id: 'user2', name: 'Bob' },
          rating: 4,
          message: 'Good!',
          date: new Date('2025-01-02'),
        },
      ];
  
      // Expected transformed result
      const expectedResult = mockFeedbacksFromDb.map(fb => ({
        username: fb.userId.name,
        rating: fb.rating,
        message: fb.message,
        date: fb.date,
      }));
  
      // Mock the Mongoose chain
      const execMock = jest.fn().mockResolvedValue(mockFeedbacksFromDb);
      const leanMock = jest.fn(() => ({ exec: execMock }));
      const limitMock = jest.fn(() => ({ lean: leanMock }));
      const sortMock = jest.fn(() => ({ limit: limitMock }));
      const populateMock = jest.fn(() => ({ sort: sortMock }));
      MockRestaurantFeedback.find = jest.fn(() => ({ populate: populateMock }));
  
      // Call the service method
      const result = await service.getRecentRestaurantFeedbacks();
  
      // Expectations
      expect(MockRestaurantFeedback.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
  

  describe('getRestaurantFeedbackSorted', () => {
    it('should return all restaurant feedbacks sorted by date with populated user and admin', async () => {
      // Mock data returned from DB
      const mockFeedbacks = [
        {
          _id: '1',
          userId: { _id: 'user1', name: 'Alice', email: 'alice@mail.com', phone: '1234' },
          adminId: { _id: 'admin1', name: 'Bob', email: 'bob@mail.com', phone: '5678' },
          message: 'Great service!',
          rating: 5,
          date: new Date('2025-01-01'),
          reply: 'Thanks!',
          replyDate: new Date('2025-01-02'),
          status: 'replied',
        },
      ];
  
      // Mock the Mongoose chain: find().sort().populate().populate().lean().exec()
      const execMock = jest.fn().mockResolvedValueOnce(mockFeedbacks);
      const leanMock = jest.fn(() => ({ exec: execMock }));
      const populateAdminMock = jest.fn(() => ({ lean: leanMock }));
      const populateUserMock = jest.fn(() => ({ populate: populateAdminMock }));
      const sortMock = jest.fn(() => ({ populate: populateUserMock }));
      MockRestaurantFeedback.find = jest.fn(() => ({ sort: sortMock }));
  
      // Call the service method
      const result = await service.getRestaurantFeedbackSorted();
  
      // Assertions
      expect(MockRestaurantFeedback.find).toHaveBeenCalled();
      expect(result).toEqual(mockFeedbacks);
    });
  });
  


});

