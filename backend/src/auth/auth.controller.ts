import { Body, Controller, Get, Post, UseGuards, Req, HttpCode, HttpStatus, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/user.decorator';
import type { Request, Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    // return {
    //   success: true,
    //   message: 'User registered successfully',
    //   data: await this.authService.register(dto),
    // };
    const { user, token } = await this.authService.register(dto);

    // SET COOKIE HERE - Environment-aware for local dev and Vercel
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // true in production/Vercel (HTTPS), false for localhost
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain (Vercel), 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Registration successful', data: user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response
  ) {
    // const result = await this.authService.login(dto.email, dto.password);

    // res.cookie('token', result.token, {
    //   httpOnly: true,
    //   secure: true,        // true in production
    //   sameSite: 'none',    // if frontend is on different domain
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });
    // return {
    //   success: true,
    //   message: 'Login successful',
    //   data: await this.authService.login(dto.email, dto.password),
    // };
    const { user, token } = await this.authService.login(email, password);

    // SET COOKIE HERE - Environment-aware for local dev and Vercel
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // true in production/Vercel (HTTPS), false for localhost
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain (Vercel), 'lax' for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Login successful', data: user };
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async profile(@Req() req: any) {
  //   return { success: true, data: await this.authService.getProfile(req.user.id) };
  // }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const profile = await this.authService.getProfile(req.user.id);
    return { data: profile };
  }



  //logout -> client-side keep endpoint for completeness (could be used to blacklist tokens)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
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
