import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { CounterDocument } from '../../common/schemas/counter.schema';


export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
    @Prop()
    id: number;

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

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isNew) return next();

  // Get Counter model safely
  const CounterModel = this.model('Counter');

  const counter = await CounterModel.findByIdAndUpdate(
    { _id: 'users' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // FIX: Cast to CounterDocument so TS knows .seq exists
  this.id = (counter as unknown as CounterDocument).seq;

  next();
});
