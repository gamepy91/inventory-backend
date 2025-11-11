import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Item } from '../items/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
