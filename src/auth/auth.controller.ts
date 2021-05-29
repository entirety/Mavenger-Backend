import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.authService.createUser(createUserDto);
  }

  @Post('/signin')
  async signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.authService.getUserById(id);
  }
}