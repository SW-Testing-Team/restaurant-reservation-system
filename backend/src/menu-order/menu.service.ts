import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';

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
  async createMenuItem(
    menuId: string,
    dto: {
      name: string;
      description?: string;
      price: number;
      category: string;
      available?: boolean;
      imageUrl?: string;
    },
  ): Promise<MenuItem> {
    // 1. Validate menu exists
    const menu = await this.menuModel.findById(menuId).exec();
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    // 2. Validate payload
    if (!dto || !dto.name || dto.price == null || !dto.category) {
      throw new BadRequestException('Invalid menu item payload');
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

    // 4. Attach the new item's ObjectId to the menu (avoid duplicates)
    await this.menuModel
      .findByIdAndUpdate(
        menuId,
        { $addToSet: { items: savedItem._id } },
        { new: true },
      )
      .exec();

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
}
