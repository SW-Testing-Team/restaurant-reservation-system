import { Body, Controller, Param, Post, Get } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';

@Controller('menu')
export class MenuController {
  constructor(private readonly MenuService: MenuService) {}

  @Get()
  getAllMenus(): Promise<any> {
    return this.MenuService.getAllMenus();
  }

  @Post(':id/items/:itemId')
  addMenuItem(
    @Param('id') menuId: string,
    @Param('itemId') menuitemId: string,
  ): Promise<Menu> {
    return this.MenuService.addMenuItem(menuId, menuitemId);
  }
  @Post()
  addMenu(@Body('title') title: string): Promise<Menu> {
    return this.MenuService.createMenu(title);
  }

  @Post(':id/items')
  createMenuItem(
    @Param('id') menuId: string,
    @Body()
    dto: {
      name: string;
      description?: string;
      price: number;
      category: string;
      available?: boolean;
      imageUrl?: string;
    },
  ): Promise<MenuItem> {
    return this.MenuService.createMenuItem(menuId, dto);
  }
}
