import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurations from './config';
import { CONFIG_CACHE, CONFIG_DB, JWT } from './config/constants';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { CacheableMemory, CacheableMemoryOptions, Keyv } from 'cacheable';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guard/authentication.guard';
import { JwtModule } from '@nestjs/jwt';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: configurations,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<TypeOrmModuleOptions>(CONFIG_DB);
        if (!config) throw new Error('Cannot start app without ORM config');
        return config;
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          CacheableMemoryOptions & { connect: string }
        >(CONFIG_CACHE);
        if (!config) throw new Error('Cannot start app without Cache config');

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: config.ttl,
                lruSize: config.lruSize,
              }),
            }),
            createKeyv(config.connect),
          ],
        };
      },
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get(JWT).secret,
        };
      },
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule {}
