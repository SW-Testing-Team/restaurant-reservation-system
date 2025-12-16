import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController (Unit)', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    listUsers: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  describe('register', () => {
    it('should register user and set cookie', async () => {
      const dto: any = { name: 'Test', email: 'test@test.com', password: '123' };
      const res = mockResponse();

      configService.get.mockReturnValue('development');
      service.register.mockResolvedValue({
        user: { id: '1', email: dto.email },
        token: 'jwt-token',
      } as any);

      const result = await controller.register(dto, res);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
        }),
      );
      expect(result.message).toBe('Registration successful');
    });
  });

  // LOGIN
  describe('login', () => {
    it('should login user and set cookie', async () => {
      const res = mockResponse();

      configService.get.mockReturnValue('development');
      service.login.mockResolvedValue({
        user: { id: '1', email: 'test@test.com' },
        token: 'jwt-token',
      } as any);

      const result = await controller.login('test@test.com', '123', res);

      expect(service.login).toHaveBeenCalledWith('test@test.com', '123');
      expect(res.cookie).toHaveBeenCalled();
      expect(result.message).toBe('Login successful');
    });
  });

  // PROFILE
  describe('profile', () => {
    it('should return user profile', async () => {
      const req: any = { user: { id: '1' } };
      service.getProfile.mockResolvedValue({ id: '1' } as any);

      const result = await controller.profile(req);

      expect(service.getProfile).toHaveBeenCalledWith('1');
      expect(result.data).toBeDefined();
    });

    it('should throw UnauthorizedException if no user', async () => {
      await expect(
        controller.profile({} as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // LOGOUT
  describe('logout', () => {
    it('should clear cookie', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(result.success).toBe(true);
    });
  });

  // LIST USERS

  describe('listUsers', () => {
    it('should return all users', async () => {
      service.listUsers.mockResolvedValue([{ id: '1' }] as any);

      const result = await controller.listUsers();

      expect(service.listUsers).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
