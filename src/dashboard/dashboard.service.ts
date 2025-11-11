import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Item } from '../items/item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) {}

  async summary() {
    const totalItems = await this.itemRepo.count();

    const { sum } = await this.itemRepo
      .createQueryBuilder('i')
      .select('COALESCE(SUM(i.qty),0)', 'sum')
      .getRawOne<{ sum: string }>();

    const totalQuantity = Number(sum) || 0;

    const lowStock = await this.itemRepo.count({
      where: { qty: LessThanOrEqual(10) },
    });
    const outOfStock = await this.itemRepo.count({ where: { qty: 0 } });

    return { totalItems, totalQuantity, lowStock, outOfStock };
  }
}
