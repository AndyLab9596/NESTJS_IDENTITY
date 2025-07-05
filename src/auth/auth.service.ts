import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRequestDto } from './dtos/request/AuthRequestDto';
import { Repository } from 'typeorm';
import { User } from 'src/domain/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'src/domain/entities/session.entity';
import { HashingProviderService } from './providers/hashingPovider.service';
import { CreatedResponseDto } from 'src/common/dtos/response/createdResponseDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    private readonly hashingProviderService: HashingProviderService,
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
      sessions: [],
      isVerified: false,
    });

    const createdUser = await this.userRepository.save(user);
    return {
      id: createdUser.id,
    };
  }

  public async signIn(authSignInRequestDto: AuthRequestDto) {
    const { email, password } = authSignInRequestDto;
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credential!');
    }

    const isPasswordMatched = await this.hashingProviderService.comaprePassword(
      password,
      user.email,
    );
    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credential!');
    }

    console.log(email, password);
  }

  private async findUserByEmail(email: string) {
    const isUserWithEmailExist = await this.userRepository.findOneBy({ email });
    return isUserWithEmailExist;
  }
}
