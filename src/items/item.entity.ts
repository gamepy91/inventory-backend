import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Warehouse } from '../warehouses/warehouse.entity';
import { Activity } from '../activities/activity.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'int', default: 0 })
  reserveQty: number;

  @Column({ type: 'int', default: 0 })
  qty: number;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Warehouse, (w) => w.items, { eager: false })
  warehouse: Warehouse;

  @OneToMany(() => Activity, (a) => a.item)
  activities: Activity[];
}
