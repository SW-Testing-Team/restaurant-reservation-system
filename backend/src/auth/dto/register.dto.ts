import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;


  @IsOptional()
  phone?: string;

  @IsOptional()
  role?: 'customer' | 'staff' | 'admin';
}
