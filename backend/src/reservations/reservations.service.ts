import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from './models/reservation.schema';
import { CreateReservationDto } from './DTO/create-reservation.dto';
import { UpdateReservationDto } from './DTO/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
  ) {}

  async create(dto: CreateReservationDto, userId: string) {
    // Validate date is not in the past
    const reservationDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservationDate < today) {
      throw new BadRequestException('Cannot make reservation for past dates');
    }

    // Get reserved tables for this date + time
    const reserved = await this.reservationModel.find({
      date: dto.date,
      time: dto.time
    });

    const takenTables = reserved.map(r => r.tableNumber);

    // Assume tables 1–20
    const allTables = Array.from({ length: 20 }, (_, i) => i + 1);
    const available = allTables.find(t => !takenTables.includes(t));

    if (!available) throw new BadRequestException('No tables available');

    // Auto-assign table
    return this.reservationModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      tableNumber: available,
    });
  }

  async getAvailableTables(date: string, time: string) {
    const reserved = await this.reservationModel.find({
      date,
      time,
    });

    const takenTables = reserved.map(r => r.tableNumber);
    const allTables = Array.from({ length: 20 }, (_, i) => i + 1);
    
    return allTables.filter(t => !takenTables.includes(t));
  }

  async findAll() {
    return this.reservationModel.find().populate('userId', 'name email');
  }

  async findOne(id: string, userId?: string) {
    const reservation = await this.reservationModel.findById(id).populate('userId', 'name email');
    
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check ownership (non-admin users can only see their own reservations)
    if (userId && reservation.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return reservation;
  }
async update(id: string, dto: UpdateReservationDto, userId?: string) {
  const reservation = await this.reservationModel.findById(id);
  
  if (!reservation) {
    throw new NotFoundException('Reservation not found');
  }

  // Check ownership - Fix the comparison
  if (userId && reservation.userId.toString() !== userId.toString()) {
    throw new ForbiddenException('Access denied');
  }

  return this.reservationModel.findByIdAndUpdate(id, dto, { new: true });
}

async cancel(id: string, userId?: string) {
  const reservation = await this.reservationModel.findById(id);
  
  if (!reservation) {
    throw new NotFoundException('Reservation not found');
  }

  // Check ownership - Fixed comparison
  if (userId && reservation.userId.toString() !== userId.toString()) {
    throw new ForbiddenException('Access denied');
  }

  // Simply delete the reservation from database
  return this.reservationModel.findByIdAndDelete(id);
}

  // Get user's own reservations
  async getUserReservations(userId: string) {
    return this.reservationModel.find({ 
      userId: new Types.ObjectId(userId) 
    }).populate('userId', 'name email');
  }
}