import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string; // e.g. 'Appetizer', 'Main Course', 'Dessert'

  @Prop({ default: true })
  available: boolean;

  @Prop()
  imageUrl: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
