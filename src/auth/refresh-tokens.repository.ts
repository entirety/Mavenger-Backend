import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from './jwt-payload.interface';
import { RefreshToken, RefreshTokenDocumnet } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectModel(RefreshToken.name) private readonly RefreshTokenModel: Model<RefreshTokenDocumnet>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async createRefreshToken(jwtPayload: JwtPayload): Promise<{ refreshToken: string }> {
    const refreshToken = new this.RefreshTokenModel();
    const { id } = jwtPayload;

    refreshToken.userId = id;
    refreshToken.isRevoked = false;

    const signOptions = {
      subject: String(id),
      jwtid: String(refreshToken._id),
      expiresIn: this.configService.get<string>('session.JwtRefreshExpiresIn'),
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
