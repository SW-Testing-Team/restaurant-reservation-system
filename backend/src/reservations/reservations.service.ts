import {
  BadRequestException,
  Injectable,
  NotFoundException,

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

  async create(dto: CreateReservationDto) {
    // Check if table is free
    const conflict = await this.reservationModel.findOne({
      tableNumber: dto.tableNumber,
      date: dto.date,
      time: dto.time,
      status: 'confirmed',
    });

    if (conflict) {
      throw new BadRequestException('Table is not available');
    }

    return this.reservationModel.create(dto);
  }

  async getAvailableTables(date: string, time: string) {
    const reserved = await this.reservationModel.find({
      date,
      time,
      status: 'confirmed',
    });

    const takenTables = reserved.map(r => r.tableNumber);

    const allTables = Array.from({ length: 20 }, (_, i) => i + 1); // tables 1-20

    return allTables.filter(t => !takenTables.includes(t));
  }

  async findAll() {
    return this.reservationModel.find().populate('userId');
  }

  async findOne(id: string) {
    return this.reservationModel.findById(id).populate('userId');
  }

  async update(id: string, dto: UpdateReservationDto) {
    return this.reservationModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async cancel(id: string) {
    return this.reservationModel.findByIdAndUpdate(id, { status: 'cancelled' });
  }
}
