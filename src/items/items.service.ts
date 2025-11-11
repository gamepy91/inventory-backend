import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { Warehouse } from '../warehouses/warehouse.entity';
import { QueryItemsDto } from './dto/query-items.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { randomUUID } from 'crypto';
import { getStockStatus } from './stock.util';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    @InjectRepository(Warehouse) private readonly whRepo: Repository<Warehouse>,
  ) {}

  private genSku() {
    return `SKU-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async list(q: QueryItemsDto) {
    const { search, warehouseId, page, pageSize, orderBy, order } = q;

    const qb = this.itemRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.warehouse', 'w')
      .orderBy(`i.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (search) {
      qb.andWhere(
        '(LOWER(i.name) LIKE :q OR LOWER(w.name) LIKE :q OR LOWER(i.sku) LIKE :q)',
        { q: `%${search.toLowerCase()}%` },
      );
    }
    if (warehouseId) qb.andWhere('w.id = :wid', { wid: warehouseId });

    const [rows, total] = await qb.getManyAndCount();

    const data = rows.map((it) => ({
      id: it.id,
      sku: it.sku,
      name: it.name,
      imageUrl: it.imageUrl ?? null,
      warehouse: it.warehouse
        ? { id: it.warehouse.id, name: it.warehouse.name }
        : null,
      qty: it.qty,
      reserveQty: it.reserveQty ?? 0,
      stockStatus: getStockStatus(it.qty),
      updatedAt: it.updatedAt,
    }));

    return { data, page, pageSize, total };
  }

  async create(dto: CreateItemDto) {
    const wh = await this.whRepo.findOne({ where: { id: dto.warehouseId } });
    if (!wh) throw new BadRequestException('Warehouse not found');

    const item = this.itemRepo.create({
      sku: this.genSku(),
      name: dto.name,
      imageUrl: dto.imageUrl,
      qty: 0,
      reserveQty: 0,
      warehouse: wh,
    });
    const saved = await this.itemRepo.save(item);
    return saved;
  }

  async findOne(id: number) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['warehouse'],
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: number, dto: UpdateItemDto) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['warehouse'],
    });
    if (!item) throw new NotFoundException('Item not found');

    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl;

    if (dto.reserveQty !== undefined) {
      if (dto.reserveQty < 0)
        throw new BadRequestException('reserveQty must be >= 0');
      item.reserveQty = dto.reserveQty;
    }

    if (dto.warehouseId !== undefined) {
      const wh = await this.whRepo.findOne({ where: { id: dto.warehouseId } });
      if (!wh) throw new BadRequestException('Warehouse not found');
      item.warehouse = wh;
    }

    const saved = await this.itemRepo.save(item);

    return {
      id: saved.id,
      sku: saved.sku,
      name: saved.name,
      imageUrl: saved.imageUrl ?? null,
      warehouse: saved.warehouse
        ? { id: saved.warehouse.id, name: saved.warehouse.name }
        : null,
      qty: saved.qty,
      reserveQty: saved.reserveQty ?? 0,
      stockStatus: getStockStatus(saved.qty),
      updatedAt: saved.updatedAt,
    };
  }
}
