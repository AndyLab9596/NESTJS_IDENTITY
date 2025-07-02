import { registerAs } from '@nestjs/config';
import { CONFIG_DB } from './constants';

export default registerAs(CONFIG_DB, () => ({
  type: process.env.ORM_TYPE,
  host: process.env.ORM_HOST,
  port: parseInt(process.env.ORM_PORT!),
  username: process.env.ORM_USERNAME,
  password: process.env.ORM_PASSWORD,
  database: process.env.ORM_DATABASE,
  logging: process.env.ORM_LOGGING,
  autoLoadEntities:
    process.env.ORM_AUTO_LOAD_ENTITIES === 'true' ? true : false,
  synchronize: process.env.ORM_SYNCHRONIZE === 'true' ? true : false,
}));
