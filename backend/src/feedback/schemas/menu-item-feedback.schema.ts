import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,Types } from 'mongoose';

export type ItemFeedbackDocument = ItemFeedback & Document;

@Schema()
export class ItemFeedback {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // <-- reference to User

  
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menuItemId: Types.ObjectId; // reference to MenuItem

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: () => new Date() })
  date: Date;

  @Prop({ default: null })
  reply?: string;

  @Prop({ default: null })
  replyDate?: Date;


 
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  adminId?: Types.ObjectId; // stores the admin user who replied


  @Prop({
    required: true,
    enum: ['pending', 'replied'],
    default: 'pending',
  })
  status: string;
}

export const ItemFeedbackSchema =
  SchemaFactory.createForClass(ItemFeedback);

