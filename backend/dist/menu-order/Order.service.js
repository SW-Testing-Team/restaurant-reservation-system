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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const Order_schema_1 = require("./models/Order.schema");
const MenuItem_schema_1 = require("./models/MenuItem.schema");
let OrderService = class OrderService {
    orderModel;
    menuItemModel;
    constructor(orderModel, menuItemModel) {
        this.orderModel = orderModel;
        this.menuItemModel = menuItemModel;
    }
    async createOrder(dto) {
        if (!mongoose_2.Types.ObjectId.isValid(dto.userId)) {
            throw new common_1.BadRequestException('Invalid userId');
        }
        let total = 0;
        for (const item of dto.items) {
            const menuItem = await this.menuItemModel.findById(item.menuItemId);
            if (!menuItem) {
                throw new common_1.NotFoundException(`Menu item ${item.menuItemId} does not exist`);
            }
            total += menuItem.price * item.quantity;
        }
        const order = new this.orderModel({
            ...dto,
            totalPrice: total,
        });
        return order.save();
    }
    async getAll() {
        return this.orderModel
            .find()
            .populate('userId')
            .populate('items.menuItemId')
            .exec();
    }
    async getOne(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('userId')
            .populate('items.menuItemId')
            .exec();
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.orderModel.findByIdAndUpdate(id, { status: dto.status }, { new: true });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return order;
    }
    async cancelOrder(id) {
        const order = await this.orderModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return order;
    }
    async deleteOrder(id) {
        const deleted = await this.orderModel.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return { message: 'Order deleted successfully' };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(Order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(MenuItem_schema_1.MenuItem.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], OrderService);
//# sourceMappingURL=Order.service.js.map