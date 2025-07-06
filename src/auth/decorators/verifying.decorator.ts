import { SetMetadata } from '@nestjs/common';
import { IS_VERIFYING } from '../constants/auth.constant';

export const IsVerifyIng = () => SetMetadata(IS_VERIFYING, true);
