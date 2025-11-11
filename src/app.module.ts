import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ItemsModule } from './items/items.module';
import { ActivitiesModule } from './activities/activities.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
    }),
    AuthModule,
    WarehousesModule,
    ItemsModule,
    ActivitiesModule,
    DashboardModule,
  ],
})
export class AppModule {}
