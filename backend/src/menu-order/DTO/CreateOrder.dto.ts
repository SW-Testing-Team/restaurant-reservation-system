import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsMongoId,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['dine-in', 'takeaway', 'delivery'])
  type: string;

  @IsOptional()
  @IsNumber()
  tableNumber?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsEnum(['preparing', 'ready', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  specialRequest?: string;
}
