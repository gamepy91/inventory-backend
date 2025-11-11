import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly whRepo: Repository<Warehouse>,
  ) {}

  async findAll() {
    return this.whRepo.find({ order: { name: 'ASC' } });
  }
}
