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

  async createUser(createUserDto: CreateUserDto): Promise<{ id: string; username: string }> {
    const { username, email, password } = createUserDto;

    const found = await this.UserModel.findOne({ $or: [{ username }, { email }] });

    if (found) throw new ConflictException();

    const createdUser = new this.UserModel(createUserDto);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    createdUser.role = UserGroups.UNVERIFIED;
    createdUser.password = hashedPassword;

    createdUser.avatar = normalize(gravatar.url(createdUser.email, { s: '200', r: 'pg', d: 'mm' }), {
      forceHttps: true,
    });

    try {
      await createdUser.save();
      return { id: createdUser._id, username: createdUser.username };
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
