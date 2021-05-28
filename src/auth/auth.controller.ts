import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.authService.createUser(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.authService.getUserById(id);
  }
}
