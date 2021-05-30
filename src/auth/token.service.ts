import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { UsersRepository } from './users.repository';

@Injectable()
export class TokenService {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly usersRepository: UsersRepository,
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
}
