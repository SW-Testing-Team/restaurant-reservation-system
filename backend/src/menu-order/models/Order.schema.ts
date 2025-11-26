import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string; // who made the order

  @Prop({ required: true, enum: ['dine-in', 'takeaway', 'delivery'] })
  type: string;

  @Prop()
  tableNumber: number;
  @Prop([
    {
      _id: false,
      menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true },
    },
  ])
  items: {
    menuItemId: string;
    quantity: number;
  }[];

  @Prop()
  totalPrice: number;

  @Prop({
    default: 'preparing',
    enum: ['preparing', 'ready', 'cancelled'],
  })
  status: string;

  @Prop()
  specialRequest: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
