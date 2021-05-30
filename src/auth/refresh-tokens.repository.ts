import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from './jwt-payload.interface';
import { RefreshTokenPayload } from './refresh-token-payload.interface';
import { RefreshToken, RefreshTokenDocumnet } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectModel(RefreshToken.name) private readonly RefreshTokenModel: Model<RefreshTokenDocumnet>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async createRefreshToken(jwtPayload: JwtPayload): Promise<{ refreshToken: string }> {
    const { id } = jwtPayload;
    const refreshToken = new this.RefreshTokenModel();

    refreshToken.userId = id;
    refreshToken.isRevoked = false;

    const payload: RefreshTokenPayload = {
      subject: String(id),
      jwtid: String(refreshToken._id),
      expiresIn: this.configService.get<string>('session.JwtRefreshExpiresIn'),
    };

    const token = await this.jwtService.signAsync({}, payload);

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

  async findTokenById(id: string): Promise<RefreshToken> {
    const token = await this.RefreshTokenModel.findById(id).select('-token');

    if (!token) throw new UnauthorizedException();

    return token;
  }

  async findTokenByUserId(id: string): Promise<RefreshToken> {
    const token = await this.RefreshTokenModel.findOne({ userId: id }).select('-token');

    if (!token) throw new UnauthorizedException();

    return token;
  }
}
