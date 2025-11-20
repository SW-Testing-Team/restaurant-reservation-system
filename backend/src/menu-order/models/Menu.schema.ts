import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MenuItem, MenuItemSchema } from './MenuItem.schema';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [MenuItemSchema], default: [] })
  items: MenuItem[]; // List of menu items
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
