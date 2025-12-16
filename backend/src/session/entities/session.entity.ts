import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Stadium } from '../../stadium/entities/stadium.entity';

export type SessionDocument = Session & Document;

export enum SessionStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Stadium' })
  stadium: Types.ObjectId | Stadium;

  @Prop({ required: true })
  date: Date; // the day of the session

  @Prop({ required: true })
  startTime: string; // format: "HH:mm"

  @Prop({ required: true })
  endTime: string; // format: "HH:mm"

  @Prop({ required: true, min: 0 })
  price: number;

  // @Prop({ default: null })
  // maxPlayers?: number;

  @Prop({ enum: SessionStatus, default: SessionStatus.AVAILABLE })
  status: SessionStatus;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
