import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string; // who made the order

  @Prop([
    {
      menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true },
    },
  ])
  items: {
    menuItemId: string;
    quantity: number;
  }[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
  })
  status: string;

  @Prop()
  specialRequest: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
