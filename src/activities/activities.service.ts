import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { Item } from '../items/item.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly actRepo: Repository<Activity>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    private readonly dataSource: DataSource,
  ) {}

  async listByItem(itemId: number, { page = 1, pageSize = 20 }: PaginationDto) {
    const [data, total] = await this.actRepo.findAndCount({
      where: { item: { id: itemId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['item'],
    });
    return { data, page, pageSize, total };
  }

  async addActivity(itemId: number, dto: CreateActivityDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const item = await qr.manager
        .getRepository(Item)
        .createQueryBuilder('i')
        .setLock('pessimistic_write')
        .where('i.id = :id', { id: itemId })
        .getOne();

      if (!item) throw new NotFoundException('Item not found');

      const delta = dto.type === 'IN' ? dto.qtyChange : -dto.qtyChange;
      const newQty = item.qty + delta;
      if (newQty < 0)
        throw new BadRequestException('Quantity cannot be negative');

      const act = this.actRepo.create({
        type: dto.type,
        qtyChange: dto.qtyChange,
        note: dto.note,
        item: { id: item.id } as any,
      });
      await qr.manager.save(Activity, act);

      item.qty = newQty;
      await qr.manager.save(Item, item);

      await qr.commitTransaction();

      return {
        item: { id: item.id, qty: item.qty, updatedAt: item.updatedAt },
        activity: {
          id: act.id,
          type: act.type,
          qtyChange: act.qtyChange,
          note: act.note,
          createdAt: act.createdAt,
        },
      };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async getSeries(itemId: number, days = 7) {
    // 1) หา item และ qty ปัจจุบัน
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');

    // 2) กำหนดกรอบวันแบบ local
    days = Math.max(1, Math.min(30, Number(days) || 7));
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const dateKeyLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`; // yyyy-mm-dd in local time
    };

    // 3) ดึงกิจกรรมในช่วง (ไม่ join อะไรเพื่อลดปัญหา lock/join)
    const acts = await this.actRepo
      .createQueryBuilder('a')
      .where('a."itemId" = :itemId', { itemId })
      .andWhere('a."createdAt" BETWEEN :start AND :end', { start, end })
      .orderBy('a."createdAt"', 'DESC')
      .getMany();

    // 4) รวม net delta ต่อวัน (local)
    const dailyDelta = new Map<string, number>();
    // เติมวันให้ครบก่อน (ค่าเริ่ม 0)
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dailyDelta.set(dateKeyLocal(d), 0);
    }
    // บวก/ลบจากกิจกรรมจริง
    for (const a of acts) {
      const key = dateKeyLocal(a.createdAt);
      const sign = a.type === 'IN' ? 1 : -1;
      dailyDelta.set(key, (dailyDelta.get(key) ?? 0) + sign * a.qtyChange);
    }

    // 5) คำนวณ "ยอดปลายวัน" โดยนับย้อนหลังจาก qty ปัจจุบัน
    //    logic: EOD(today) = currentQty
    //           EOD(D-1)   = EOD(D) - delta(D)  ... ไล่กลับไปทีละวัน
    const endOfDayByKey = new Map<string, number>();
    let rolling = item.qty; // เริ่มจากยอดปัจจุบัน (ปลายวันวันนี้)
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dateKeyLocal(d);
      endOfDayByKey.set(key, rolling);
      // เตรียมค่าของวันก่อนหน้า = ยอดวันถัดไป - delta(วันถัดไป)
      rolling -= dailyDelta.get(key) ?? 0;
    }

    // 6) กลับลำดับเป็นเก่า→ใหม่ เพื่อให้กราฟอ่านง่าย
    const series: { date: string; qty: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dateKeyLocal(d);
      series.push({ date: key, qty: endOfDayByKey.get(key) ?? 0 });
    }

    return { itemId, series };
  }
}
