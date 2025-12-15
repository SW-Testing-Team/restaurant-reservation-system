import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuService } from './menu.service';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MenuService (Unit)', () => {
  let service: MenuService;

  // ---------- Shared save mock ----------
  const saveMock = jest.fn();

  // ---------- Menu Model Mock ----------
  const MenuModelMock = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as any;

  MenuModelMock.find = jest.fn();
  MenuModelMock.findById = jest.fn();
  MenuModelMock.findByIdAndUpdate = jest.fn();

  // ---------- MenuItem Model Mock ----------
  const MenuItemModelMock = jest.fn().mockImplementation(() => ({
    save: saveMock,
  })) as any;

  MenuItemModelMock.findById = jest.fn();
  MenuItemModelMock.findOne = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getModelToken(Menu.name),
          useValue: MenuModelMock,
        },
        {
          provide: getModelToken(MenuItem.name),
          useValue: MenuItemModelMock,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // createMenu
  // =============================
  describe('createMenu', () => {
    it('should create and save menu', async () => {
      saveMock.mockResolvedValue({ title: 'Lunch Menu' });

      const result = await service.createMenu('Lunch Menu');

      expect(MenuModelMock).toHaveBeenCalledWith({ title: 'Lunch Menu' });
      expect(saveMock).toHaveBeenCalled();
      expect(result.title).toBe('Lunch Menu');
    });

    it('should throw BadRequestException if title is null', async () => {
      await expect(service.createMenu(null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // =============================
  // getMenuById
  // =============================
  describe('getMenuById', () => {
    it('should return menu if found', async () => {
      const menu = { id: '1', title: 'Menu' };

      MenuModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(menu),
        }),
      });

      const result = await service.getMenuById('1');
      expect(result).toEqual(menu);
    });

    it('should throw NotFoundException if menu not found', async () => {
      MenuModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getMenuById('1')).rejects.toThrow(NotFoundException);
    });
  });

  // =============================
  // createMenuItem
  // =============================
  describe('createMenuItem', () => {
    it('should create new menu item', async () => {
      MenuItemModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      saveMock.mockResolvedValue({
        name: 'Burger',
        price: 50,
      });

      const result = await service.createMenuItem({
        name: 'Burger',
        price: 50,
        category: 'Food',
      } as any);

      expect(MenuItemModelMock).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(result.name).toBe('Burger');
    });

    it('should throw BadRequestException if item already exists', async () => {
      MenuItemModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Burger' }),
      });

      await expect(
        service.createMenuItem({
          name: 'Burger',
          price: 50,
          category: 'Food',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =============================
  // deleteMenu
  // =============================
  describe('deleteMenu', () => {
    it('should delete menu if exists', async () => {
      const deleteOneMock = jest.fn();

      MenuModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          deleteOne: deleteOneMock,
        }),
      });

      const result = await service.deleteMenu('1');

      expect(deleteOneMock).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if menu not found', async () => {
      MenuModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteMenu('1')).rejects.toThrow(NotFoundException);
    });
  });
});
