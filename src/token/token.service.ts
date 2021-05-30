import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { RefreshToken } from './schemas/refresh-token.schema';

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

// TODO: Move token service to own folder
@Injectable()
export class TokenService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  BASE_OPTIONS: JwtSignOptions = {
    header: {
      alg: this.configService.get<string>('session.JwtSignAlgorithm'),
    },
    algorithm: this.configService.get('session.JwtSignAlgorithm'),
  };

  async generateAccessToken(jwtPayload: JwtPayload): Promise<string> {
    const { id, username } = jwtPayload;

    const opts: JwtSignOptions = {
      ...this.BASE_OPTIONS,
      expiresIn: this.configService.get<string>('session.JwtAccessExpiresIn'),
      subject: String(id),
    };

    return this.jwtService.signAsync({ username }, opts);
  }

  async generateRefreshToken(jwtPayload: JwtPayload): Promise<{ refreshToken: string }> {
    return this.refreshTokensRepository.createRefreshToken(jwtPayload);
  }

  async resolveRefreshToken(encodedToken: string): Promise<{ user; token: RefreshToken }> {
    const payload: RefreshTokenPayload = await this.decodeRefreshToken(encodedToken);
    const { jti } = payload;

    if (!jti) throw new UnprocessableEntityException('Refresh token malformed');

    const token = await this.refreshTokensRepository.findTokenById(jti);

    if (!token) throw new UnauthorizedException('Refresh token invalid');

    if (token.isRevoked) throw new UnauthorizedException('Refresh token revoked');

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) throw new UnprocessableEntityException('Refresh token malformed');

    return { user, token };
  }

  async generateAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
    const { user } = await this.resolveRefreshToken(refreshToken);
    const payload: JwtPayload = { id: user._id, username: user.username };

    const token = await this.generateAccessToken(payload);

    return token;
  }

  private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (err) {
      throw new UnprocessableEntityException('Refresh token expired');
    }
  }

  private async getUserFromRefreshTokenPayload(refreshTokenPayload: RefreshTokenPayload): Promise<User> {
    const { sub } = refreshTokenPayload;

    if (!sub) throw new UnprocessableEntityException('Refresh token malformed');

    return this.UserModel.findById(sub).select('-password');
  }
}
