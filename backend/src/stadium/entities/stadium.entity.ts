import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StadiumDocument = Stadium & Document;

@Schema({ timestamps: true })
export class Stadium {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Map, of: String })
  amenities: Map<string, string>;
  // Optional: map of amenities, e.g., {"parking": "available", "wifi": "yes"}

  @Prop({ default: [] })
  favorites: string[];
  // Optional: list of user IDs who favorited this stadium
}

export const StadiumSchema = SchemaFactory.createForClass(Stadium);
