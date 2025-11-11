import 'dotenv/config';
import dataSource from './data-source';

import { User } from './users/user.entity';
import { Warehouse } from './warehouses/warehouse.entity';
import { Item } from './items/item.entity';
import { Activity } from './activities/activity.entity';

import * as bcrypt from 'bcrypt';

async function run() {
  (dataSource.options as any).entities = [User, Warehouse, Item, Activity];

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const whRepo = dataSource.getRepository(Warehouse);
  const itemRepo = dataSource.getRepository(Item);

  const email = 'admin@example.com';
  let admin = await userRepo.findOne({ where: { email } });
  if (!admin) {
    admin = userRepo.create({
      email,
      passwordHash: await bcrypt.hash('123456', 10),
    });
    await userRepo.save(admin);
  }

  let wh = await whRepo.findOne({ where: { name: 'Main Warehouse' } });
  if (!wh) {
    wh = await whRepo.save(whRepo.create({ name: 'Main Warehouse' }));
  }

  const existItem = await itemRepo.findOne({ where: { name: 'Demo Item' } });
  if (!existItem) {
    await itemRepo.save(
      itemRepo.create({
        name: 'Demo Item',
        sku: 'SKU-DEMO',
        warehouse: wh,
        qty: 0,
        reserveQty: 0,
        imageUrl: 'https://picsum.photos/seed/demo/120',
      }),
    );
  }

  await dataSource.destroy();
  console.log('✅ Seeding completed');
}

run().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
