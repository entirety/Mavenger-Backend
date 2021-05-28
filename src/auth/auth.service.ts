import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserGroups } from './user-groups.enum';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly UserModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.UserModel(createUserDto);
    createdUser.role = UserGroups.UNVERIFIED;

    return createdUser.save();
  }

  async getUserById(id: string): Promise<User> {
    return this.UserModel.findById(id);
  }
}
