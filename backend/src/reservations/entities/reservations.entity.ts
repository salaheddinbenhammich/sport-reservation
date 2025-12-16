import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { IsNumber } from 'class-validator';
import mongoose, { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Reservation extends Document {
  // The user who created the reservation
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId;

  // tadium reserved
  @Prop({ type: Types.ObjectId, ref: 'Stadium', required: true })
  stadium: Types.ObjectId;

  // Session (time slot)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Session' }], required: true })
  sessions: Types.ObjectId[];

  // all players included in this reservation
  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] }) // types mixed so that even the invited players who have not account yet still receive the invitation
  players: (Types.ObjectId | string)[];

  // total price for the reservation
  @Prop({ required: true })
  totalPrice: number;

  // Whether payment is split among players or not
  @Prop({ default: false })
  isSplitPayment: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false })
  payment?: Types.ObjectId;

  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] })
  status: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  paidParticipants: mongoose.Types.ObjectId[];

  @Prop({ unique: true, index: true })
  bookingReference: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
