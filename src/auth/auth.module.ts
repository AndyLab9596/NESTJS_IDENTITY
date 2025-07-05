import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/entities';
import { Session } from 'src/domain/entities/session.entity';
import { HashingProviderService } from './providers/hashingPovider.service';
import { BcryptProviderService } from './providers/bcryptProvider.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProviderService,
      useClass: BcryptProviderService,
    },
  ],
  imports: [TypeOrmModule.forFeature([User, Session])],
})
export class AuthModule {}
