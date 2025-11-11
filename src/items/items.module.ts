import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Warehouse])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
