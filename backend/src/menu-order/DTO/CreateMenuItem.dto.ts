import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  available?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
