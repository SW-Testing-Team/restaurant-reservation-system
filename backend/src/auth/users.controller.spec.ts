import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      listUsers: jest.fn(),
      getProfile: jest.fn(),
      // We'll mock authRepo for update and delete
      authRepo: {
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', name: 'Alice' }];
      (authService.listUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(result).toEqual({ success: true, data: mockUsers });
      expect(authService.listUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', name: 'Alice' };
      (authService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.getUserById('1');

      expect(result).toEqual({ success: true, data: mockUser });
      expect(authService.getProfile).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      (authService.getProfile as jest.Mock).mockResolvedValue(null);

      await expect(controller.getUserById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update and return user', async () => {
      const updateData = { name: 'Bob' };
      const updatedUser = { id: '1', name: 'Bob' };
      (authService.authRepo.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateUser('1', updateData);

      expect(result).toEqual({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      });
      expect(authService.authRepo.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw NotFoundException if update fails', async () => {
      (authService.authRepo.update as jest.Mock).mockResolvedValue(null);

      await expect(controller.updateUser('1', { name: 'Bob' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      (authService.authRepo.delete as jest.Mock).mockResolvedValue(true);

      const result = await controller.deleteUser('1');

      expect(result).toEqual({
        success: true,
        message: 'User deleted successfully',
      });
      expect(authService.authRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if delete fails', async () => {
      (authService.authRepo.delete as jest.Mock).mockResolvedValue(null);

      await expect(controller.deleteUser('1')).rejects.toThrow(NotFoundException);
    });
  });
});
