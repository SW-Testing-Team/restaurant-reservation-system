import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './models/Order.schema';
import { CreateOrderDto } from './DTO/CreateOrder.dto';
import { UpdateOrderStatusDto } from './DTO/UpdateOrder.dto';
import { MenuItem } from './models/MenuItem.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
  ) {}

  // CREATE ORDER
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Validate user exists (OPTIONAL if you want)
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException('Invalid userId');
    }

    // Validate items and calculate total price
    let total = 0;

    for (const item of dto.items) {
      const menuItem = await this.menuItemModel.findById(item.menuItemId);

      if (!menuItem) {
        throw new NotFoundException(
          `Menu item ${item.menuItemId} does not exist`,
        );
      }

      total += menuItem.price * item.quantity;
    }

    const order = new this.orderModel({
      ...dto,
      totalPrice: total,
    });

    return order.save();
  }

  // GET ALL ORDERS
  async getAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('userId')
      .populate('items.menuItemId')
      .exec();
  }

  // GET ONE ORDER
  async getOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId')
      .populate('items.menuItemId')
      .exec();

    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  // UPDATE ORDER STATUS
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true },
    );

    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  // CANCEL ORDER (using status)
  async cancelOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );

    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  // DELETE ORDER
  async deleteOrder(id: string): Promise<{ message: string }> {
    const deleted = await this.orderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Order ${id} not found`);

    return { message: 'Order deleted successfully' };
  }
}
