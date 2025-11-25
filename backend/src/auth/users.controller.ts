import {
  Controller,
  Get,
  Param,
  Put,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  //GET ALL USERS
  @Get()
  async getAllUsers() {
    const users = await this.authService.listUsers();
    return {
      success: true,
      data: users,
    };
  }

  //GET USER BY ID
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.authService.getProfile(id);
    if (!user) throw new NotFoundException('User not found');

    return {
      success: true,
      data: user,
    };
  }

  //UPDATE USER BY ID
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    updateData: {
      name?: string;
      email?: string;
      role?: 'customer' | 'staff' | 'admin';
      phone?: string;
    },
  ) {
    const updated = await (this.authService as any).authRepo.update(id, updateData);

    if (!updated) throw new NotFoundException('User not found');

    return {
      success: true,
      message: 'User updated successfully',
      data: updated,
    };
  }

  //DELETE USER
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deleted = await (this.authService as any).authRepo.delete(id);

    if (!deleted) throw new NotFoundException('User not found');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
