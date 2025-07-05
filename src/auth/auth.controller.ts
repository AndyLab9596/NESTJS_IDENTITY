import { Body, Controller, Post } from '@nestjs/common';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';
import { AuthService } from './auth.service';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public async signUp(
    @Body() authSignUpRequestDto: AuthRequestDto,
  ): Promise<CreatedResponseDto> {
    return await this.authService.signUp(authSignUpRequestDto);
  }

  @Post('sign-in')
  public async signIn(@Body() authSignInRequestDto: AuthRequestDto) {
    return await this.authService.signIn(authSignInRequestDto);
  }
}
