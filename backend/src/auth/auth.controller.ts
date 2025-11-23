import { Body, Controller, Get, Post, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      message: 'User registered successfully',
      data: await this.authService.register(dto),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return {
      success: true,
      message: 'Login successful',
      data: await this.authService.login(dto.email, dto.password),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: any) {
    return { success: true, data: await this.authService.getProfile(req.user.id) };
  }

  //logout -> client-side keep endpoint for completeness (could be used to blacklist tokens)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) {
    return { success: true, message: 'Logged out successfully' };
  }

  //admin only: get all users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async listUsers() {
    const users = await this.authService.listUsers();
    return { success: true, data: users };
  }
}
