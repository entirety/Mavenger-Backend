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
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly tokenService: TokenService,
    private jwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.UserModel.findOne({ username: { $regex: new RegExp(`^${username.toLowerCase()}`, 'i') } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { id: user._id, username };
      const token: string = await this.tokenService.generateAccessToken(payload);
      // TODO: Implement refresh token validation method and fetch / create refresh token then use
      // this.tokenService.generateAccessTokenFromRefreshToken to generate the token

      return { token };
    }
    throw new UnauthorizedException('Please check your login credentials');
  }

  async getUserById(id: string): Promise<User> {
    return this.UserModel.findById(id).select('-password');
  }
}
