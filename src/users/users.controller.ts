import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject, Req } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { REQUEST_USER } from 'src/auth/constants/auth.constant';

@Controller('users')
export class UsersController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('')
  public getUsers(@Req() req: Request) {
    // await this.cacheManager.set('key', 30);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req[REQUEST_USER] || 'user';
  }
}
