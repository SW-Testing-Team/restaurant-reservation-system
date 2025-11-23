"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const Menu_schema_1 = require("./models/Menu.schema");
const MenuItem_schema_1 = require("./models/MenuItem.schema");
let MenuService = class MenuService {
    menuModel;
    menuItemModel;
    constructor(menuModel, menuItemModel) {
        this.menuModel = menuModel;
        this.menuItemModel = menuItemModel;
    }
    async createMenu(title) {
        if (title == null) {
            throw new common_1.BadRequestException('title is invalid');
        }
        const newMenu = new this.menuModel({ title: title });
        return newMenu.save();
    }
    async getAllMenus() {
        return this.menuModel.find().populate('items').exec();
    }
    async getMenuById(id) {
        const menu = await this.menuModel.findById(id).populate('items').exec();
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        return menu;
    }
    async addMenuItem(menuId, menuitemId) {
        const menu = await this.menuModel.findById(menuId).exec();
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with ID ${menuId} not found`);
        }
        const menuitem = await this.menuItemModel.findById(menuitemId).exec();
        if (!menuitem) {
            throw new common_1.NotFoundException(`Menu item with ID ${menuitemId} not found`);
        }
        const updatedMenu = await this.menuModel
            .findByIdAndUpdate(menuId, {
            $addToSet: { items: menuitem._id },
        }, { new: true })
            .populate('items')
            .exec();
        if (!updatedMenu) {
            throw new common_1.NotFoundException(`Menu with ID ${menuId} not found`);
        }
        return updatedMenu;
    }
    async removeMenuItem(menuId, menuItemId) {
        if (!menuItemId) {
            throw new common_1.BadRequestException('menuItemId is invalid');
        }
        const updatedMenu = await this.menuModel
            .findByIdAndUpdate(menuId, { $pull: { items: new mongoose_2.Types.ObjectId(menuItemId) } }, { new: true })
            .populate('items')
            .exec();
        if (!updatedMenu) {
            throw new common_1.NotFoundException(`Menu with ID ${menuId} not found`);
        }
        return updatedMenu;
    }
    async createMenuItem(dto) {
        if (!dto || !dto.name || dto.price == null || !dto.category) {
            throw new common_1.BadRequestException('Invalid menu item payload');
        }
        const menuitem = await this.menuItemModel
            .findOne({ name: dto.name, category: dto.category })
            .exec();
        if (menuitem) {
            throw new common_1.BadRequestException(`Menu item with name ${dto.name} in category ${dto.category} already exists`);
        }
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
    async deleteMenu(id) {
        const menu = await this.menuModel.findById(id).exec();
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        await menu.deleteOne();
        return menu;
    }
    async deleteMenuItem(menuItemId) {
        const menuItem = await this.menuItemModel.findById(menuItemId).exec();
        if (!menuItem) {
            throw new common_1.NotFoundException(`Menu with ID ${menuItemId} not found`);
        }
        await menuItem.deleteOne();
        return menuItem;
    }
    async updateMenuItem(menuItemId, dto) {
        const menuItem = await this.menuItemModel.findById(menuItemId).exec();
        if (!menuItem) {
            throw new common_1.NotFoundException(`Menu item with ID ${menuItemId} not found`);
        }
        menuItem.name = dto.name ?? menuItem.name;
        menuItem.description = dto.description ?? menuItem.description;
        menuItem.price = dto.price ?? menuItem.price;
        menuItem.category = dto.category ?? menuItem.category;
        menuItem.available = dto.available ?? menuItem.available;
        menuItem.imageUrl = dto.imageUrl ?? menuItem.imageUrl;
        return menuItem.save();
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(Menu_schema_1.Menu.name)),
    __param(1, (0, mongoose_1.InjectModel)(MenuItem_schema_1.MenuItem.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MenuService);
//# sourceMappingURL=menu.service.js.map