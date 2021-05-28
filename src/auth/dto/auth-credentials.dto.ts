import { IsString } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;
}
