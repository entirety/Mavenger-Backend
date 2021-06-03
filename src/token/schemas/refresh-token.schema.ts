import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class RefreshToken {
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'user', unique: true })
  user: Types.ObjectId;

  @Prop()
  isRevoked: boolean;

  @Prop()
  token: string;

  @Prop()
  expiration: Date;
}

export type RefreshTokenDocument = RefreshToken & Document;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
