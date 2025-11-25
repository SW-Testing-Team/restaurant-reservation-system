import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
import { CreateMenuItemDto } from './DTO/CreateMenuItem.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly MenuService: MenuService) {}

  @Get()
  getAllMenus(): Promise<any> {
    return this.MenuService.getAllMenus();
  }
  @Get(':id')
  getMenuById(@Param('id') menuId: string): Promise<Menu> {
    return this.MenuService.getMenuById(menuId);
  }

  @Post()
  CreateMenu(@Body('title') title: string): Promise<Menu> {
    return this.MenuService.createMenu(title);
  }

  @Delete(':id')
  deleteMenu(@Param('id') menuId: string): Promise<Menu> {
    return this.MenuService.deleteMenu(menuId);
  }

  @Post('/items')
  createMenuItem(
    @Body()
    dto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.MenuService.createMenuItem(dto);
  }

  @Patch(':id/items/:itemId')
  addMenuItem(
    @Param('id') menuId: string,
    @Param('itemId') menuitemId: string,
  ): Promise<Menu> {
    return this.MenuService.addMenuItem(menuId, menuitemId);
  }
  @Delete(':id/items/:itemId')
  removeMenuItem(
    @Param('id') menuId: string,
    @Param('itemId') menuitemId: string,
  ): Promise<Menu> {
    return this.MenuService.removeMenuItem(menuId, menuitemId);
  }

  @Delete('/items/:itemId')
  deleteMenuItem(@Param('itemId') menuitemId: string): Promise<MenuItem> {
    return this.MenuService.deleteMenuItem(menuitemId);
  }

  @Patch('/items/:itemId')
  updateMenuItem(
    @Param('itemId') menuitemId: string,
    @Body()
    dto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.MenuService.updateMenuItem(menuitemId, dto);
  }
}
