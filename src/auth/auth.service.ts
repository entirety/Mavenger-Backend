import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserGroups } from './user-groups.enum';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const createdUser = new this.UserModel(createUserDto);

    const { password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    createdUser.role = UserGroups.UNVERIFIED;
    createdUser.password = hashedPassword;
    try {
      await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.UserModel.findOne({ username: { $regex: new RegExp(`^${username.toLowerCase()}`, 'i') } });

    if (user && (await bcrypt.compare(password, user.password))) {
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
