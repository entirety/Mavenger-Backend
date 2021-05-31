import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './users.repository';
import { TokenService } from 'src/token/token.service';
import { RefreshTokensRepository } from 'src/token/refresh-tokens.repository';
import { RefreshToken } from 'src/token/schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly tokenService: TokenService,
    private jwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    const { id, username } = await this.usersRepository.createUser(createUserDto);
    const payload: JwtPayload = { id, username };

    await this.tokenService.generateRefreshToken(payload);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const { username, password } = authCredentialsDto;
    const user: UserDocument = await this.UserModel.findOne({
      username: { $regex: new RegExp(`^${username.toLowerCase()}`, 'i') },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { id: user._id, username };

      try {
        const found: RefreshToken = await this.refreshTokensRepository.findTokenByUserId(user._id);

        if (found) {
          await this.refreshTokensRepository.deleteRefreshToken(found._id);
        }
      } catch (err) {
        throw new Error();
      }

      const { refreshToken } = await this.tokenService.generateRefreshToken(payload);

      const token: string = await this.tokenService.generateAccessTokenFromRefreshToken(refreshToken);

      return { token };
    }
    throw new UnauthorizedException('Please check your login credentials');
  }

  async getUserById(id: string): Promise<User> {
    return this.UserModel.findById(id).select('-password');
  }

  async refreshAccessToken(userId: string): Promise<{ user: User; token: string }> {
    return this.tokenService.refreshAccessToken(userId);
  }
}
