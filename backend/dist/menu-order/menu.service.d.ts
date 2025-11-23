import { Model } from 'mongoose';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
export declare class MenuService {
    private menuModel;
    private menuItemModel;
    constructor(menuModel: Model<Menu>, menuItemModel: Model<MenuItem>);
    createMenu(title: string): Promise<Menu>;
    getAllMenus(): Promise<Menu[]>;
    getMenuById(id: string): Promise<Menu>;
    addMenuItem(menuId: string, menuitemId: string): Promise<Menu>;
    removeMenuItem(menuId: string, menuItemId: string): Promise<Menu>;
    createMenuItem(menuId: string, dto: {
        name: string;
        description?: string;
        price: number;
        category: string;
        available?: boolean;
        imageUrl?: string;
    }): Promise<MenuItem>;
    deleteMenu(id: string): Promise<Menu>;
}
