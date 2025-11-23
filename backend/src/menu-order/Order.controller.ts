import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrderService } from './Order.service';
import { CreateOrderDto } from './DTO/CreateOrder.dto';
import { UpdateOrderStatusDto } from './DTO/UpdateOrder.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // CREATE ORDER
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  // GET ALL ORDERS
  @Get()
  findAll() {
    return this.orderService.getAll();
  }

  // GET ONE ORDER
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.getOne(id);
  }

  // UPDATE ORDER STATUS
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, dto);
  }

  // CANCEL ORDER
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  // DELETE ORDER
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
