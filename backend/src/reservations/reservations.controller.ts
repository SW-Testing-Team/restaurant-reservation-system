import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Query,
  Delete,
  Patch,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationService } from './reservations.service';
import { CreateReservationDto } from './DTO/create-reservation.dto';
import { UpdateReservationDto } from './DTO/update-reservation.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateReservationDto,
    @Req() req
  ) {
    return this.reservationService.create(dto, req.user.id);
  }

  @Get('available')
  getAvailable(
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.reservationService.getAvailableTables(date, time);
  }

  // User can see their own reservations
  @Get('my-reservations')
  @UseGuards(JwtAuthGuard)
  getMyReservations(@Req() req) {
    return this.reservationService.getUserReservations(req.user.id);
  }

  // Admin only: get all reservations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    // Admin can access any reservation, users can only access their own
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.reservationService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateReservationDto,
    @Req() req
  ) {
    // Admin can update any reservation, users can only update their own
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.reservationService.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req) {
    // Admin can cancel any reservation, users can only cancel their own
    const userId = req.user.role === 'admin' ? undefined : req.user.id;
    return this.reservationService.cancel(id, userId);
  }
}