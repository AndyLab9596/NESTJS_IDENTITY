import { CONFIG_CACHE } from './constants';
import { registerAs } from '@nestjs/config';

export default registerAs(CONFIG_CACHE, () => ({
  ttl: parseInt(process.env.CACHE_TTL!),
  lruSize: parseInt(process.env.CACHE_LRU_SIZE!),
  connect: process.env.CACHE_CONNECT,
  host: process.env.CACHE_HOST,
  port: parseInt(process.env.CACHE_PORT!),
}));
