import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  public async signUp(
    @Body() authSignUpRequestDto: AuthRequestDto,
  ): Promise<CreatedResponseDto> {
    return await this.authService.signUp(authSignUpRequestDto);
  }

  @Public()
  @Post('sign-in')
  public async signIn(
    @Body() authSignInRequestDto: AuthRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.signIn(authSignInRequestDto, response);
  }

  @Get('refresh-token')
  public async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.refreshToken(request, response);
  }
}
