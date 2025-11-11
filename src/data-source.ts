import 'dotenv/config';
import { DataSource } from 'typeorm';

const isProd = process.env.NODE_ENV === 'production';

const entitiesPath = isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts';
const migrationsPath = isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts';

const needSsl =
  process.env.DATABASE_URL?.includes('render.com') ||
  process.env.DB_SSL === 'true' ||
  isProd;

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: needSsl ? { rejectUnauthorized: false } : false,
  extra: needSsl ? { ssl: { rejectUnauthorized: false } } : {},

  entities: [entitiesPath],
  migrations: [migrationsPath],

  synchronize: false,
  logging: !isProd,
});
