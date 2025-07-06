import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';

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
  public async signIn(
    @Body() authSignInRequestDto: AuthRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.signIn(authSignInRequestDto, response);
  }
}
