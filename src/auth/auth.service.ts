import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { CookieOptions, Request, Response } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import {
  COOKIE_REFRESH_TOKEN,
  PREFIX_TOKEN_IAT,
  REQUEST_USER,
} from './constants/auth.constant';
import { ITokenPayload } from './interfaces/tokenPayload.interface';
import { ChangePasswordRequestDto } from './dtos/request/ChangePasswordRequestDto';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly MAX_AGE_COOKIE = 1000 * 60 * 60 * 24 * 7; // 7 days
  private readonly COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: this.MAX_AGE_COOKIE,
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
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
      iat: Math.floor(Date.now() / 1000), // milisecond -> second
    };

    const { accessToken, refreshToken } = await this.createTokenPair(payload);

    await this.cacheManager.set(
      `${PREFIX_TOKEN_IAT}_${user.id}_${payload.jit}`,
      refreshToken,
    );

    response.cookie(COOKIE_REFRESH_TOKEN, refreshToken, {
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

  public async refreshToken(request: Request, response: Response) {
    const refreshToken = request.cookies[COOKIE_REFRESH_TOKEN];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const verifyRefreshToken = await this.jwtService.verifyAsync(refreshToken);

    if (!verifyRefreshToken) {
      throw new UnauthorizedException();
    }

    const requestUser = request[REQUEST_USER];
    if (!requestUser) {
      throw new UnauthorizedException();
    }

    const isRefreshTokenInRedis = await this.cacheManager.get(
      `${PREFIX_TOKEN_IAT}_${requestUser.sub}_${requestUser.jit}`,
    );

    if (isRefreshTokenInRedis) {
      response.clearCookie(COOKIE_REFRESH_TOKEN, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: this.MAX_AGE_COOKIE,
      });

      await this.cacheManager.del(
        `${PREFIX_TOKEN_IAT}_${requestUser.sub}_${requestUser.jit}`,
      );
    }

    const payload = {
      sub: requestUser.sub,
      email: requestUser.email,
      jit: uuidv4(),
      iat: Math.floor(Date.now() / 1000), // milisecond -> second
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.createTokenPair(payload);

    await this.cacheManager.set(
      `${PREFIX_TOKEN_IAT}_${requestUser.sub}_${payload.jit}`,
      newRefreshToken,
    );

    response.cookie(COOKIE_REFRESH_TOKEN, newRefreshToken, this.COOKIE_OPTIONS);

    return {
      message: 'Sign in successfully',
      data: {
        userId: requestUser.sub,
        accessToken: newAccessToken,
      },
    };
  }

  public async signOut(request: Request) {
    const requestUser = request[REQUEST_USER];
    await this.cacheManager.del(
      `${PREFIX_TOKEN_IAT}_${requestUser.sub}_${requestUser.jit}`,
    );
    // TODO: Will see if it is needed or not
    // response.clearCookie(COOKIE_REFRESH_TOKEN, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'strict',
    //     maxAge: this.MAX_AGE_COOKIE,
    //   });
  }

  public async changePassword(
    changePasswordRequestDto: ChangePasswordRequestDto,
    request: Request,
  ) {
    const { currentPassword, newPassword } = changePasswordRequestDto;
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be difference than the current password',
      );
    }

    const requestUser = request[REQUEST_USER];

    const user = await this.userRepository.findOneBy({
      email: requestUser.email,
    });

    if (!user) {
      throw new BadRequestException('Invalid credential!');
    }

    const isPasswordMatched = await this.hashingProviderService.comaprePassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credential!');
    }

    const hashedPassword =
      await this.hashingProviderService.hashPassword(newPassword);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Sign out all user
    await this.signOutAll(user.id);

    return {
      message: 'Update password successfully',
      data: {
        userId: user.id,
      },
    };
  }

  private async signOutAll(userId: string) {
    const keys = await this.scanKeysByPattern(
      `${PREFIX_TOKEN_IAT}_${userId}_*`,
    );
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  public async scanKeysByPattern(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }

  private async createTokenPair(payload: ITokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtConfiguration.accessTokenExpiresIn!,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.jwtConfiguration.refreshTokenExpiresIn!,
    });
    return { accessToken, refreshToken };
  }

  private async findUserByEmail(email: string) {
    const isUserWithEmailExist = await this.userRepository.findOneBy({ email });
    return isUserWithEmailExist;
  }
}
