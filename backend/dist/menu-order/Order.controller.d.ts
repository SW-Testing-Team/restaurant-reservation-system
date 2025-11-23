import { OrderService } from './Order.service';
import { CreateOrderDto } from './DTO/CreateOrder.dto';
import { UpdateOrderStatusDto } from './DTO/UpdateOrder.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(dto: CreateOrderDto): Promise<import("./models/Order.schema").Order>;
    findAll(): Promise<import("./models/Order.schema").Order[]>;
    findOne(id: string): Promise<import("./models/Order.schema").Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("./models/Order.schema").Order>;
    cancel(id: string): Promise<import("./models/Order.schema").Order>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
