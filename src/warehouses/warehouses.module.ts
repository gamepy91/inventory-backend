// src/warehouses/warehouses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { Warehouse } from './warehouse.entity';
import { Item } from '../items/item.entity';
import { Activity } from '../activities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Item, Activity])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
