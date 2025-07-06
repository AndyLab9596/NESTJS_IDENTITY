import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BcryptProviderService } from './providers/bcryptProvider.service';
import { HashingProviderService } from './providers/hashingPovider.service';
import { RedisProvider } from 'src/shared/providers/redis.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProviderService,
      useClass: BcryptProviderService,
    },
    RedisProvider,
  ],
  imports: [TypeOrmModule.forFeature([User])],
})
export class AuthModule {}
