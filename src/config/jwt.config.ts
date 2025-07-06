import { registerAs } from '@nestjs/config';
import { JWT } from './constants';

export default registerAs(JWT, () => {
  return {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  };
});
