import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  tableNumber: number;

  @Prop({ required: true })
  date: string;  // format: YYYY-MM-DD

  @Prop({ required: true })
  time: string;  // format: HH:mm

  @Prop({
  match: /^01[0-2,5]{1}[0-9]{8}$/ // Egyptian phone number pattern
})
phoneNumber: string;


  @Prop({ required: true })
  guests: number;

  @Prop({
    default: 'confirmed',
    enum: ['confirmed', 'cancelled'],
  })
  status: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
