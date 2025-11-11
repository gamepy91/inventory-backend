import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Item } from '../items/item.entity';

export type ActivityType = 'IN' | 'OUT';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: ActivityType;

  @Column({ type: 'int' })
  qtyChange: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Item, (item) => item.activities)
  item: Item;
}
