import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from '../reservations/models/reservation.schema';
import { Order } from '../menu-order/models/Order.schema';
import { MenuItem } from '../menu-order/models/MenuItem.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItem>,
  ) {}

  async getStatistics() {
    // Get total reservations count
    const totalReservations = await this.reservationModel.countDocuments();

    // Get total orders count
    const totalOrders = await this.orderModel.countDocuments();

    // Get total revenue (sum of all order totalPrice)
    const revenueResult = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get top 5 most ordered menu items
    const topMenuItems = await this.orderModel.aggregate([
      // Unwind the items array to get individual item documents
      { $unwind: '$items' },
      // Group by menuItemId and count occurrences
      {
        $group: {
          _id: '$items.menuItemId',
          orderCount: { $sum: '$items.quantity' },
        },
      },
      // Sort by count descending
      { $sort: { orderCount: -1 } },
      // Limit to top 5
      { $limit: 5 },
      // Lookup menu item details
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItemDetails',
        },
      },
      // Unwind the lookup result (should be single item)
      { $unwind: '$menuItemDetails' },
      // Project the final shape
      {
        $project: {
          _id: 0,
          menuItem: {
            name: '$menuItemDetails.name',
            price: '$menuItemDetails.price',
            category: '$menuItemDetails.category',
          },
          orderCount: 1,
        },
      },
    ]);

    return {
      totalReservations,
      totalOrders,
      totalRevenue,
      topMenuItems,
    };
  }
}

