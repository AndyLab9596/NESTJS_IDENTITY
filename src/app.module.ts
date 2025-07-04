import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurations from './config';
import { CONFIG_DB } from './config/constants';

import { UsersModule } from './users/users.module';
import { SesionModule } from './session/session.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UsersModule,

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

    SesionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
