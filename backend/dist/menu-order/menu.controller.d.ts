import { MenuService } from './menu.service';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
export declare class MenuController {
    private readonly MenuService;
    constructor(MenuService: MenuService);
    getAllMenus(): Promise<any>;
    addMenuItem(menuId: string, menuitem: MenuItem): Promise<Menu>;
    addMenu(title: string): Promise<Menu>;
}
