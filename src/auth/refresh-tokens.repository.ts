import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocumnet } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectModel(RefreshToken.name) private readonly RefreshTokenModel: Model<RefreshTokenDocumnet>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async createRefreshToken(userId: string): Promise<{ refreshToken: string }> {
    const refreshToken = new this.RefreshTokenModel();

    refreshToken.userId = userId;
    refreshToken.isRevoked = false;

    const signOptions = {
      expiresIn: this.configService.get<string>('session.JwtRefreshExpiresIn'),
      subject: userId,
      jwtid: String(refreshToken._id),
    };

    const token = await this.jwtService.signAsync({}, signOptions);

    refreshToken.token = token;

    try {
      await refreshToken.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      } else {
        console.log(err);
        throw new InternalServerErrorException();
      }
    }

    return { refreshToken: token };
  }
}
