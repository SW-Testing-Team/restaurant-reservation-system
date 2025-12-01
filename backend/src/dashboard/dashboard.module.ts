import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from '../reservations/models/reservation.schema';
import { Order, OrderSchema } from '../menu-order/models/Order.schema';
import { MenuItem, MenuItemSchema } from '../menu-order/models/MenuItem.schema';
import { RestaurantFeedback, RestaurantFeedbackSchema } from '../feedback/schemas/restaurant-feedback.schema';
import { ItemFeedback, ItemFeedbackSchema } from '../feedback/schemas/menu-item-feedback.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: RestaurantFeedback.name, schema: RestaurantFeedbackSchema },
      { name: ItemFeedback.name, schema: ItemFeedbackSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
