import { Model } from 'mongoose';
import { Order } from './models/Order.schema';
import { CreateOrderDto } from './DTO/CreateOrder.dto';
import { UpdateOrderStatusDto } from './DTO/UpdateOrder.dto';
import { MenuItem } from './models/MenuItem.schema';
export declare class OrderService {
    private orderModel;
    private menuItemModel;
    constructor(orderModel: Model<Order>, menuItemModel: Model<MenuItem>);
    createOrder(dto: CreateOrderDto): Promise<Order>;
    getAll(): Promise<Order[]>;
    getOne(id: string): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
    cancelOrder(id: string): Promise<Order>;
    deleteOrder(id: string): Promise<{
        message: string;
    }>;
}
