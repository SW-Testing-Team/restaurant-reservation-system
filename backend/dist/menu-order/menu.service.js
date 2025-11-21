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
let MenuService = class MenuService {
    menuModel;
    constructor(menuModel) {
        this.menuModel = menuModel;
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
    async addMenuItem(menuId, menuitem) {
        if (this.menuModel.findById(menuId) == null) {
            throw new common_1.NotFoundException(`Menu with ID ${menuId} not found`);
        }
        if (!menuitem)
            throw new common_1.NotFoundException('menu item was not found');
        const updated = await this.menuModel
            .findByIdAndUpdate(menuId, { $addToSet: { items: menuitem } }, { new: true })
            .populate('items')
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Menu with ID ${menuId} not found`);
        }
        return updated;
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
    async deleteMenu(id) {
        const menu = await this.menuModel.findById(id).exec();
        if (!menu) {
            throw new common_1.NotFoundException(`Menu with ID ${id} not found`);
        }
        await menu.deleteOne();
        return menu;
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(Menu_schema_1.Menu.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MenuService);
//# sourceMappingURL=menu.service.js.map