import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['preparing', 'ready', 'cancelled'])
  status: string;
}
