import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Warehouse } from './warehouses/warehouse.entity';
import { Item } from './items/item.entity';
import { Activity } from './activities/activity.entity';
import 'dotenv/config';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Warehouse, Item, Activity],
  migrations: ['src/migrations/*.ts'],
});
