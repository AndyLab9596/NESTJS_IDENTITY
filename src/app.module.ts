import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,

    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'qweasdzxc',
        database: 'NESTJS_IDENTITY',
        logging: true,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
