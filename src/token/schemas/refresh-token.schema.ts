import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RefreshToken {
  @Prop({ unique: true })
  userId: string;

  @Prop()
  isRevoked: boolean;

  @Prop()
  token: string;

  @Prop()
  expiration: Date;
}

export type RefreshTokenDocumnet = RefreshToken & Document;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
