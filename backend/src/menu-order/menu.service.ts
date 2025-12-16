import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';
import { CreateMenuItemDto } from './DTO/CreateMenuItem.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<Menu>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
  ) {}

  // Create a new menu
  async createMenu(title: string): Promise<Menu> {
    if (title == null) {
      throw new BadRequestException('title is invalid');
    }
    const newMenu = new this.menuModel({ title: title });
    return newMenu.save();
  }

  // Get all menus
  async getAllMenus(): Promise<Menu[]> {
    return this.menuModel.find().populate('items').exec();
  }

  // Get single menu by ID
  async getMenuById(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).populate('items').exec();
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async addMenuItem(menuId: string, menuitemId: string): Promise<Menu> {
    // 1. Check menu exists
    const menu = await this.menuModel.findById(menuId).exec();
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    // 2. Check menu item exists
    const menuitem = await this.menuItemModel.findById(menuitemId).exec();
    if (!menuitem) {
      throw new NotFoundException(`Menu item with ID ${menuitemId} not found`);
    }

    // 3. Update menu - save ONLY the ObjectId
    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(
        menuId,
        {
          $addToSet: { items: menuitem._id }, // Avoid duplicates
        },
        { new: true },
      )
      .populate('items')
      .exec();

    if (!updatedMenu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    return updatedMenu;
  }

  // Remove a MenuItem from a menu
  async removeMenuItem(menuId: string, menuItemId: string): Promise<Menu> {
    if (!menuItemId) {
      throw new BadRequestException('menuItemId is invalid');
    }
    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(
        menuId,
        { $pull: { items: new Types.ObjectId(menuItemId) } },
        { new: true },
      )
      .populate('items')
      .exec();
    if (!updatedMenu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }
    return updatedMenu;
  }

  // Create a new MenuItem and attach it to a Menu
  async createMenuItem(dto: CreateMenuItemDto): Promise<MenuItem> {
    if (!dto || !dto.name || dto.price == null || !dto.category) {
      throw new BadRequestException('Invalid menu item payload');
    }

    const menuitem = await this.menuItemModel
      .findOne({ name: dto.name, category: dto.category })
      .exec();
    if (menuitem) {
      throw new BadRequestException(
        `Menu item with name ${dto.name} in category ${dto.category} already exists`,
      );
    }

    // 3. Create and save the MenuItem
    const newItem = new this.menuItemModel({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      available: dto.available ?? true,
      imageUrl: dto.imageUrl,
    });

    const savedItem = await newItem.save();

    return savedItem;
  }

  async assigncreateMenuItem(
    menuId: string,
    dto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    if (!dto || !dto.name || dto.price == null || !dto.category) {
      throw new BadRequestException('Invalid menu item payload');
    }

    const menuitem = await this.menuItemModel
      .findOne({ name: dto.name, category: dto.category })
      .exec();
    if (menuitem) {
      throw new BadRequestException(
        `Menu item with name ${dto.name} in category ${dto.category} already exists`,
      );
    }

    // 3. Create and save the MenuItem
    const newItem = new this.menuItemModel({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      available: dto.available ?? true,
      imageUrl: dto.imageUrl,
    });

    const savedItem = await newItem.save();

    await this.addMenuItem(menuId, savedItem._id.toString());

    return savedItem;
  }

  // Delete a menu
  async deleteMenu(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    await menu.deleteOne();
    return menu;
  }

  // Delete a MenuItem
  async deleteMenuItem(menuItemId: string): Promise<MenuItem> {
    // 1. Check menu exists
    const menuItem = await this.menuItemModel.findById(menuItemId).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu with ID ${menuItemId} not found`);
    }
    await menuItem.deleteOne();
    return menuItem;
  }

  async updateMenuItem(
    menuItemId: string,
    dto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemModel.findById(menuItemId).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuItemId} not found`);
    }
    menuItem.name = dto.name ?? menuItem.name;
    menuItem.description = dto.description ?? menuItem.description;
    menuItem.price = dto.price ?? menuItem.price;
    menuItem.category = dto.category ?? menuItem.category;
    menuItem.available = dto.available ?? menuItem.available;
    menuItem.imageUrl = dto.imageUrl ?? menuItem.imageUrl;
    return menuItem.save();
  }
}
