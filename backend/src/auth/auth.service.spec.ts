import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService (Unit)', () => {
  let service: AuthService;
  let repo: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockAuthRepo = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    userModel: {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // REGISTER
  // =============================
  describe('register', () => {
    it('should throw BadRequest if missing fields', async () => {
      await expect(service.register({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if email exists', async () => {
      repo.findByEmail.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.register({
          name: 'Test',
          email: 'test@test.com',
          password: '123',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user and return token', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue({
        _id: '1',
        name: 'Test',
        email: 'test@test.com',
        role: 'customer',
      } as any);

      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({
        name: 'Test',
        email: 'test@test.com',
        password: '123',
      } as any);

      expect(repo.create).toHaveBeenCalled();
      expect(result.token).toBe('jwt-token');
    });
  });

  // =============================
  // LOGIN
  // =============================
  describe('login', () => {
    it('should throw BadRequest if missing fields', async () => {
      await expect(service.login('', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw Unauthorized if user not found', async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('test@test.com', '123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw Unauthorized if password mismatch', async () => {
      repo.findByEmail.mockResolvedValue({ password: 'hashed' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@test.com', '123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully', async () => {
      repo.findByEmail.mockResolvedValue({
        _id: '1',
        password: 'hashed',
        name: 'Test',
        email: 'test@test.com',
        role: 'customer',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@test.com', '123');

      expect(result.token).toBe('jwt-token');
    });
  });

  // =============================
  // GET PROFILE
  // =============================
  describe('getProfile', () => {
    it('should return user', async () => {
      repo.findById.mockResolvedValue({ id: '1' } as any);

      const result = await service.getProfile('1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getProfile('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =============================
  // LIST USERS
  // =============================
  describe('listUsers', () => {
    it('should return users list', async () => {
      mockAuthRepo.userModel.exec.mockResolvedValue([{ id: '1' }]);

      const result = await service.listUsers();
      expect(result.length).toBe(1);
    });
  });
});
