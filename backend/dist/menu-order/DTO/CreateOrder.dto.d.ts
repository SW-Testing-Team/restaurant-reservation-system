declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    userId: string;
    items: OrderItemDto[];
    specialRequest?: string;
}
export {};
