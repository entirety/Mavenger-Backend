import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from './schemas/user.schema';

export interface AccessTokenInterface {
  sub: number;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get<string>('session.JwtSecretOrKey'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: AccessTokenInterface): Promise<User> {
    const { sub } = payload;
    const user: User = await this.UserModel.findById(sub).select('-password');

    if (!user) throw new UnauthorizedException();

    return user; // Specify exactly what to return later
  }
}
