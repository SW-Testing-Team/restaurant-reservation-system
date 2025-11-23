import { Model } from 'mongoose';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
import { CreateMenuItemDto } from './DTO/CreateMenuItem.dto';
export declare class MenuService {
    private menuModel;
    private menuItemModel;
    constructor(menuModel: Model<Menu>, menuItemModel: Model<MenuItem>);
    createMenu(title: string): Promise<Menu>;
    getAllMenus(): Promise<Menu[]>;
    getMenuById(id: string): Promise<Menu>;
    addMenuItem(menuId: string, menuitemId: string): Promise<Menu>;
    removeMenuItem(menuId: string, menuItemId: string): Promise<Menu>;
    createMenuItem(dto: CreateMenuItemDto): Promise<MenuItem>;
    deleteMenu(id: string): Promise<Menu>;
    deleteMenuItem(menuItemId: string): Promise<MenuItem>;
    updateMenuItem(menuItemId: string, dto: CreateMenuItemDto): Promise<MenuItem>;
}
