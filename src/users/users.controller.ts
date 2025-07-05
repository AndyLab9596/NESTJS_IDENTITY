import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Controller('users')
export class UsersController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('')
  public async getUsers() {
    await this.cacheManager.set('key', 30);
    return 'getUsers';
  }
}
