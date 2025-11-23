import { MenuService } from './menu.service';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
import { CreateMenuItemDto } from './DTO/CreateMenuItem.dto';
export declare class MenuController {
    private readonly MenuService;
    constructor(MenuService: MenuService);
    getAllMenus(): Promise<any>;
    getMenuById(menuId: string): Promise<Menu>;
    CreateMenu(title: string): Promise<Menu>;
    deleteMenu(menuId: string): Promise<Menu>;
    createMenuItem(menuId: string, dto: CreateMenuItemDto): Promise<MenuItem>;
    addMenuItem(menuId: string, menuitemId: string): Promise<Menu>;
    removeMenuItem(menuId: string, menuitemId: string): Promise<Menu>;
    deleteMenuItem(menuitemId: string): Promise<MenuItem>;
    updateMenuItem(menuitemId: string, dto: CreateMenuItemDto): Promise<MenuItem>;
}
