"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModule = void 0;
const common_1 = require("@nestjs/common");
const menu_controller_1 = require("./menu.controller");
const menu_service_1 = require("./menu.service");
const Order_controller_1 = require("./Order.controller");
const Order_service_1 = require("./Order.service");
const mongoose_1 = require("@nestjs/mongoose");
const Menu_schema_1 = require("./models/Menu.schema");
const MenuItem_schema_1 = require("./models/MenuItem.schema");
const Order_schema_1 = require("./models/Order.schema");
let MenuModule = class MenuModule {
};
exports.MenuModule = MenuModule;
exports.MenuModule = MenuModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: Menu_schema_1.Menu.name, schema: Menu_schema_1.MenuSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: MenuItem_schema_1.MenuItem.name, schema: MenuItem_schema_1.MenuItemSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: Order_schema_1.Order.name, schema: Order_schema_1.OrderSchema }]),
        ],
        controllers: [menu_controller_1.MenuController, Order_controller_1.OrderController],
        providers: [menu_service_1.MenuService, Order_service_1.OrderService],
    })
], MenuModule);
//# sourceMappingURL=menu.module.js.map