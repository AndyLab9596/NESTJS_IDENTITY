import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'At least 3 chars' })
  password: string;
}
