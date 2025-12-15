import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password, phone, role } = dto;

    if (!name || !email || !password) {
      throw new BadRequestException('Name, email and password are required');
    }

    const existing = await this.authRepo.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.authRepo.create({
      name,
      email,
      password: hash,
      phone,
      role: role || 'customer',
    });

    const token = this.signToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    if (!email || !password)
      throw new BadRequestException('Email and password required');

    const user = await this.authRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user._id.toString());

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  //admin: list users
  async listUsers() {
    return (await (this.authRepo as any).userModel
      .find()
      .select('-password')
      .exec()) as unknown[];
  }

  private signToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}
