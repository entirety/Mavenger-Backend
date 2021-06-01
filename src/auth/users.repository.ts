import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as normalize from 'normalize-url';
import * as bcrypt from 'bcrypt';
import * as gravatar from 'gravatar';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserGroups } from './user-groups.enum';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { username, email, password } = createUserDto;

    const found: UserDocument = await this.UserModel.findOne({ $or: [{ username }, { email }] });

    if (found) {
      throw new ConflictException({
        statusCode: 409,
        message: ['username or email already in use'],
        error: 'Conflict error',
      });
    }

    const createdUser: UserDocument = new this.UserModel(createUserDto);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    createdUser.role = UserGroups.UNVERIFIED;
    createdUser.password = hashedPassword;

    createdUser.avatar = normalize(gravatar.url(createdUser.email, { s: '200', r: 'pg', d: 'mm' }), {
      forceHttps: true,
    });

    try {
      await createdUser.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      } else {
        throw new InternalServerErrorException();
      }
    }

    return createdUser;
  }
}
