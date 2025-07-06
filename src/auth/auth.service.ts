import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';
import { Repository } from 'typeorm';
import { User } from 'src/domain/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProviderService } from './providers/hashingPovider.service';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';

@Injectable()
export class AuthService {
  private readonly MAX_AGE_COOKIE = 1000 * 60 * 60 * 24 * 7;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly hashingProviderService: HashingProviderService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly jwtService: JwtService,
  ) {}

  public async signUp(
    authSignUpRequestDto: AuthRequestDto,
  ): Promise<CreatedResponseDto> {
    const { email, password } = authSignUpRequestDto;

    const isUserWithEmailExist = await this.findUserByEmail(email);
    if (isUserWithEmailExist) {
      throw new BadRequestException('Email is already existed');
    }

    const hashedPassword =
      await this.hashingProviderService.hashPassword(password);

    const user = this.userRepository.create({
      email: authSignUpRequestDto.email,
      password: hashedPassword,
      isVerified: false,
    });

    const createdUser = await this.userRepository.save(user);
    return {
      id: createdUser.id,
    };
  }

  public async signIn(
    authSignInRequestDto: AuthRequestDto,
    response: Response,
  ) {
    const { email, password } = authSignInRequestDto;
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credential!');
    }

    const isPasswordMatched = await this.hashingProviderService.comaprePassword(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credential!');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtConfiguration.accessTokenExpiresIn!,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtConfiguration.refreshTokenExpiresIn!,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: this.MAX_AGE_COOKIE,
    });

    return {
      message: 'Sign in successfully',
      data: {
        userId: user.id,
        accessToken,
      },
    };
  }

  private async findUserByEmail(email: string) {
    const isUserWithEmailExist = await this.userRepository.findOneBy({ email });
    return isUserWithEmailExist;
  }
}
