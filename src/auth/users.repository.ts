import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserGroups } from './user-groups.enum';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const createdUser = new this.UserModel(createUserDto);

    const { password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    createdUser.role = UserGroups.UNVERIFIED;
    createdUser.password = hashedPassword;

    try {
      await createdUser.save();
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
