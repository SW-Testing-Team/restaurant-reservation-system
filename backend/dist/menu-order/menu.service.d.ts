import { Model } from 'mongoose';
import { Menu, MenuDocument } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
export declare class MenuService {
    private menuModel;
    constructor(menuModel: Model<MenuDocument>);
    createMenu(title: string): Promise<Menu>;
    getAllMenus(): Promise<Menu[]>;
    getMenuById(id: string): Promise<Menu>;
    addMenuItem(menuId: string, menuitem: MenuItem): Promise<Menu>;
    removeMenuItem(menuId: string, menuItemId: string): Promise<Menu>;
    deleteMenu(id: string): Promise<Menu>;
}
