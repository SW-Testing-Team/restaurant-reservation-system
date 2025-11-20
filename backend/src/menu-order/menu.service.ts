import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from './models/Menu.schema';
import { MenuItem } from './models/MenuItem.schema';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<MenuDocument>) {}

  // Create a new menu
  async createMenu(title: string): Promise<Menu> {
    if (title == null) {
      throw new BadRequestException('title is invalid');
    }
    const newMenu = new this.menuModel(title);
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

  async addMenuItem(menuId: string, menuitem: MenuItem): Promise<Menu> {
    if (!menuitem) throw new NotFoundException('menu item was not found');

    const updated = await this.menuModel
      .findByIdAndUpdate(
        menuId,
        { $addToSet: { items: menuitem } }, // prevents duplicates
        { new: true },
      )
      .populate('items')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    return updated;
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

  // Delete a menu
  async deleteMenu(id: string): Promise<Menu> {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return this.menuModel.findByIdAndDelete(id).exec();
  }
}
