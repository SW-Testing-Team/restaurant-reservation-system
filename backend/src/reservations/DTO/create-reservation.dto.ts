import { IsString, IsNumber, IsDateString, IsOptional, Matches, IsIn } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  userId: string;

  @IsNumber()
  tableNumber: number;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsOptional()
  @Matches(/^01[0-2,5]{1}[0-9]{8}$/)
  phoneNumber?: string; 

  @IsNumber()
  guests: number;
  
  @IsIn(['confirmed', 'cancelled'])
  status: string;
}
