import { Body, Controller, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';
import { ChangePasswordRequestDto } from './dtos/request/ChangePasswordRequestDto';
import { IsVerifyIng } from './decorators/verifying.decorator';

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

  @Post('refresh-token')
  public async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.refreshToken(request, response);
  }

  @Post('change-password')
  public async changePassword(
    @Body() changePasswordRequestDto: ChangePasswordRequestDto,
    @Req() request: Request,
  ) {
    return await this.authService.changePassword(
      changePasswordRequestDto,
      request,
    );
  }

  @Post('send-verify-user-code')
  @IsVerifyIng()
  public async sendVerifyUserCode(@Req() request: Request) {
    return this.authService.sendVerifyUserCode(request);
  }

  @Post('verify-user/:code')
  @IsVerifyIng()
  public async verifyUser(
    @Param('code') code: number,
    @Req() request: Request,
  ) {
    return await this.authService.verifyUser(code, request);
  }

  @Post('forgot-password')
  public async forgotPassword() {
    // TODO
  }

  @Post('sign-out')
  public async signOut(@Req() request: Request) {
    return await this.authService.signOut(request);
  }
}
