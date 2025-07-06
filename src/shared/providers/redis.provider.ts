import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CONFIG_CACHE, REDIS_CLIENT } from 'src/config/constants';

export const RedisProvider: Provider = {
  inject: [ConfigService],
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new Redis({
      host: configService.get(CONFIG_CACHE).host,
      port: configService.get(CONFIG_CACHE).port,
    });
  },
};
