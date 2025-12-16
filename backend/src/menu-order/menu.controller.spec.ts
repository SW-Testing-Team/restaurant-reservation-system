import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './DTO/CreateMenuItem.dto';

describe('MenuController (Unit)', () => {
  let controller: MenuController;
  let service: jest.Mocked<MenuService>;

  const mockMenuService = {
    getAllMenus: jest.fn(),
    getMenuById: jest.fn(),
    assigncreateMenuItem: jest.fn(),
    createMenu: jest.fn(),
    deleteMenu: jest.fn(),
    createMenuItem: jest.fn(),
    addMenuItem: jest.fn(),
    removeMenuItem: jest.fn(),
    deleteMenuItem: jest.fn(),
    updateMenuItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    service = module.get(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =============================
  // getAllMenus
  // =============================
  describe('getAllMenus', () => {
    it('should return all menus', async () => {
      const menus = [{ title: 'Menu 1' }];

      service.getAllMenus.mockResolvedValue(menus as any);

      const result = await controller.getAllMenus();

      expect(service.getAllMenus).toHaveBeenCalled();
      expect(result).toEqual(menus);
    });
  });

  // =============================
  // getMenuById
  // =============================
  describe('getMenuById', () => {
    it('should call service with menuId', async () => {
      const menu = { title: 'Menu' };

      service.getMenuById.mockResolvedValue(menu as any);

      const result = await controller.getMenuById('1');

      expect(service.getMenuById).toHaveBeenCalledWith('1');
      expect(result).toEqual(menu);
    });
  });

  // =============================
  // createMenu
  // =============================
  describe('createMenu', () => {
    it('should create a menu', async () => {
      const menu = { title: 'New Menu' };

      service.createMenu.mockResolvedValue(menu as any);

      const result = await controller.CreateMenu('New Menu');

      expect(service.createMenu).toHaveBeenCalledWith('New Menu');
      expect(result).toEqual(menu);
    });
  });

  // =============================
  // deleteMenu
  // =============================
  describe('deleteMenu', () => {
    it('should delete menu by id', async () => {
      const menu = { title: 'Deleted Menu' };

      service.deleteMenu.mockResolvedValue(menu as any);

      const result = await controller.deleteMenu('1');

      expect(service.deleteMenu).toHaveBeenCalledWith('1');
      expect(result).toEqual(menu);
    });
  });

  // =============================
  // createMenuItem
  // =============================
  describe('createMenuItem', () => {
    it('should create menu item', async () => {
      const dto: CreateMenuItemDto = {
        name: 'Burger',
        price: 50,
        category: 'Food',
      } as any;

      const item = { name: 'Burger' };

      service.assigncreateMenuItem.mockResolvedValue(item as any);

      const result = await controller.createMenuItem('1', dto);

      expect(service.assigncreateMenuItem).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(item);
    });
  });

  // =============================
  // addMenuItem
  // =============================
  describe('addMenuItem', () => {
    it('should add menu item to menu', async () => {
      const menu = { title: 'Menu' };

      service.addMenuItem.mockResolvedValue(menu as any);

      const result = await controller.addMenuItem('1', '10');

      expect(service.addMenuItem).toHaveBeenCalledWith('1', '10');
      expect(result).toEqual(menu);
    });
  });

  // =============================
  // removeMenuItem
  // =============================
  describe('removeMenuItem', () => {
    it('should remove menu item from menu', async () => {
      const menu = { title: 'Menu' };

      service.removeMenuItem.mockResolvedValue(menu as any);

      const result = await controller.removeMenuItem('1', '10');

      expect(service.removeMenuItem).toHaveBeenCalledWith('1', '10');
      expect(result).toEqual(menu);
    });
  });

  // =============================
  // deleteMenuItem
  // =============================
  describe('deleteMenuItem', () => {
    it('should delete menu item', async () => {
      const item = { name: 'Burger' };

      service.deleteMenuItem.mockResolvedValue(item as any);

      const result = await controller.deleteMenuItem('10');

      expect(service.deleteMenuItem).toHaveBeenCalledWith('10');
      expect(result).toEqual(item);
    });
  });

  // =============================
  // updateMenuItem
  // =============================
  describe('updateMenuItem', () => {
    it('should update menu item', async () => {
      const dto: CreateMenuItemDto = {
        name: 'Updated Burger',
        price: 60,
        category: 'Food',
      } as any;

      const item = { name: 'Updated Burger' };

      service.updateMenuItem.mockResolvedValue(item as any);

      const result = await controller.updateMenuItem('10', dto);

      expect(service.updateMenuItem).toHaveBeenCalledWith('10', dto);
      expect(result).toEqual(item);
    });
  });
});
