import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
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

    const newRefreshToken: RefreshTokenDocumnet = new this.RefreshTokenModel({
      user: Types.ObjectId(id),
      isRevoked: false,
    });

    const expiresIn: Date = new Date();
    expiresIn.setDate(expiresIn.getDate() + 3);
    newRefreshToken.expiration = expiresIn;

    const payload: RefreshTokenPayload = {
      subject: String(id),
      jwtid: String(newRefreshToken._id),
      expiresIn: this.configService.get<string>('session.JwtRefreshExpiresIn'),
    };

    const token: string = await this.jwtService.signAsync({}, payload);
    newRefreshToken.token = token;

    try {
      await newRefreshToken.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      } else {
        throw new InternalServerErrorException();
      }
    }

    return { refreshToken: token };
  }

  async findTokenById(id: string): Promise<RefreshToken> {
    const token: RefreshTokenDocumnet = await this.RefreshTokenModel.findById(id);

    if (!token) throw new UnauthorizedException();

    return token;
  }

  async findTokenByUserId(id: string): Promise<RefreshToken> {
    const token: RefreshTokenDocumnet = await this.RefreshTokenModel.findOne({ user: Types.ObjectId(id) });

    if (!token) throw new UnauthorizedException();

    return token;
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.RefreshTokenModel.findByIdAndDelete(id);
  }
}
