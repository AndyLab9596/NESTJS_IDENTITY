import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'At least 3 chars' })
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'At least 3 chars' })
  newPassword: string;
}
