import { DataSourceOptions } from 'typeorm';

import * as dotenv from 'dotenv';
const ENV = process.env.NODE_ENV;
const envFile = !ENV ? '.env' : `.env.${ENV}`;
console.log('envFile', envFile);
dotenv.config({ path: `../${envFile}` });

const baseOptions = {
  type: process.env.ORM_CONNECTION,
  host: process.env.ORM_HOST,
  port: parseInt(process.env.ORM_PORT!),
  username: process.env.ORM_USERNAME,
  password: process.env.ORM_PASSWORD,
  database: process.env.ORM_DATABASE,
  synchronize: process.env.ORM_SYNCHRONIZE === 'true' ? true : false,
  dropSchema: false,
  entities: ['../src/**/*.entity.ts'],
};

const defaultOptions: DataSourceOptions = {
  ...baseOptions,
  type: 'postgres',
  migrationsRun: true,
  logging: true,
  migrationsTableName: '__migrations',
  migrations: ['../migrations/**/*.ts'],
};

const seedOptions: DataSourceOptions = {
  ...baseOptions,
  type: 'postgres',
  name: 'seed',
  migrationsRun: true,
  logging: true,
  migrationsTableName: '__seeds',
  migrations: ['../seeds/**/*.ts'],
};

export default { defaultOptions, seedOptions };
