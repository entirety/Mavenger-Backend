import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, RefreshTokenDocumnet } from './schemas/refresh-token.schema';
import { UsersRepository } from './users.repository';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name) private readonly RefreshModel: Model<RefreshTokenDocumnet>,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private jwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    return this.usersRepository.createUser(createUserDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.UserModel.findOne({ username: { $regex: new RegExp(`^${username.toLowerCase()}`, 'i') } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Test Code
      const rToken = await this.refreshTokensRepository.createRefreshToken(user.id);

      console.log(rToken);
      // End Test Code

      const payload: JwtPayload = { id: user._id, username };
      const token: string = await this.jwtService.sign(payload);

      return { token };
    }
    throw new UnauthorizedException('Please check your login credentials');
  }

  async getUserById(id: string): Promise<User> {
    return this.UserModel.findById(id).select('-password');
  }
}
