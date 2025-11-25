import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { OrderController } from './Order.controller';
import { OrderService } from './Order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './models/Menu.schema';
import { MenuItem, MenuItemSchema } from './models/MenuItem.schema';
import { Order, OrderSchema } from './models/Order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Menu.name, schema: MenuSchema }]),
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [MenuController, OrderController],
  providers: [MenuService, OrderService],
})
export class MenuModule {}
