import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ enum: ['customer', 'staff', 'admin'], default: 'customer' })
    role: 'customer' | 'staff' | 'admin';

    @Prop()
    phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);