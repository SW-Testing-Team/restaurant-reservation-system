import { IsMongoId, IsString, IsNumber, IsDateString, IsOptional, Matches, Min, Max } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) // HH:mm format
  time: string;

  @IsOptional()
  @Matches(/^01[0-2,5]{1}[0-9]{8}$/)
  phoneNumber?: string;

  @IsNumber()
  @Min(1)
  @Max(20) // Adjust based on your table capacity
  guests: number;
}