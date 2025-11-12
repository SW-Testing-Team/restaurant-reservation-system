import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MenuItem, MenuItemSchema } from './MenuItem.schema';

@Schema({ timestamps: true })
export class Menu extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [MenuItemSchema], default: [] })
  items: MenuItem[]; // List of menu items
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
