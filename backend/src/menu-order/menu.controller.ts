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

  @Post(':id/items')
  addMenuItem(
    @Param('id') menuId: string,
    @Body() menuitem: MenuItem,
  ): Promise<Menu> {
    return this.MenuService.addMenuItem(menuId, menuitem);
  }
  @Post()
  addMenu(@Body('title') title: string): Promise<Menu> {
    return this.MenuService.createMenu(title);
  }
}
