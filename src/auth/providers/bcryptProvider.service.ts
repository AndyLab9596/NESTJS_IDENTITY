/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingProviderService } from './hashingPovider.service';

@Injectable()
export class BcryptProviderService implements HashingProviderService {
  public async hashPassword(data: string | Buffer): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data, salt);
    return hashedPassword;
  }
  public async comaprePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(data, encrypted);
    return isMatch;
  }
}
