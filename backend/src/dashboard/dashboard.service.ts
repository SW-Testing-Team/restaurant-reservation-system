import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from '../reservations/models/reservation.schema';
import { Order } from '../menu-order/models/Order.schema';
import { MenuItem } from '../menu-order/models/MenuItem.schema';
import { RestaurantFeedback } from '../feedback/schemas/restaurant-feedback.schema';
import { ItemFeedback } from '../feedback/schemas/menu-item-feedback.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItem>,
    @InjectModel(RestaurantFeedback.name)
    private restaurantFeedbackModel: Model<RestaurantFeedback>,
    @InjectModel(ItemFeedback.name)
    private itemFeedbackModel: Model<ItemFeedback>,
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

    // Get feedback statistics
    const totalRestaurantFeedback = await this.restaurantFeedbackModel.countDocuments();
    const totalItemFeedback = await this.itemFeedbackModel.countDocuments();
    const totalFeedback = totalRestaurantFeedback + totalItemFeedback;

    // Get average rating from restaurant feedback
    const restaurantRatingResult = await this.restaurantFeedbackModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    const restaurantAverageRating =
      restaurantRatingResult.length > 0 && restaurantRatingResult[0].count > 0
        ? restaurantRatingResult[0].averageRating
        : 0;

    // Get average rating from item feedback
    const itemRatingResult = await this.itemFeedbackModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    const itemAverageRating =
      itemRatingResult.length > 0 && itemRatingResult[0].count > 0
        ? itemRatingResult[0].averageRating
        : 0;

    // Calculate overall average rating
    const overallAverageRating =
      totalFeedback > 0
        ? (restaurantAverageRating * totalRestaurantFeedback +
            itemAverageRating * totalItemFeedback) /
          totalFeedback
        : 0;

    // Get pending feedback count (unreplied)
    const pendingRestaurantFeedback = await this.restaurantFeedbackModel.countDocuments({
      status: 'pending',
    });
    const pendingItemFeedback = await this.itemFeedbackModel.countDocuments({
      status: 'pending',
    });
    const totalPendingFeedback = pendingRestaurantFeedback + pendingItemFeedback;

    // Get replied feedback count
    const repliedRestaurantFeedback = await this.restaurantFeedbackModel.countDocuments({
      status: 'replied',
    });
    const repliedItemFeedback = await this.itemFeedbackModel.countDocuments({
      status: 'replied',
    });
    const totalRepliedFeedback = repliedRestaurantFeedback + repliedItemFeedback;

    return {
      totalReservations,
      totalOrders,
      totalRevenue,
      topMenuItems,
      feedbackSummary: {
        totalFeedback,
        averageRating: Math.round(overallAverageRating * 10) / 10, // Round to 1 decimal
        pendingFeedback: totalPendingFeedback,
        repliedFeedback: totalRepliedFeedback,
        restaurantFeedback: totalRestaurantFeedback,
        itemFeedback: totalItemFeedback,
      },
    };
  }

  async getRecentActivity() {
    const recentReservations = await this.reservationModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentFeedback = await this.restaurantFeedbackModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const activities = [
      ...recentReservations.map((r: any) => ({
        type: 'reservation',
        date: r.createdAt || r.date,
        details: `Table ${r.tableNumber} reserved`,
        id: r._id,
      })),
      ...recentOrders.map((o: any) => ({
        type: 'order',
        date: o.createdAt,
        details: `Order #${o._id}`,
        id: o._id,
      })),
      ...recentFeedback.map((f: any) => ({
        type: 'feedback',
        date: f.createdAt,
        details: `${f.rating}-star rating`,
        id: f._id,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }
}

