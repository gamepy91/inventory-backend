import 'dotenv/config';
import dataSource from './data-source';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';
import { Warehouse } from './warehouses/warehouse.entity';
import { Item } from './items/item.entity';

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const whRepo = dataSource.getRepository(Warehouse);
  const itemRepo = dataSource.getRepository(Item);

  const adminEmail = 'admin@example.com';
  const found = await userRepo.findOne({ where: { email: adminEmail } });
  if (!found) {
    const passwordHash = await bcrypt.hash('123456', 10);
    await userRepo.save({ email: adminEmail, passwordHash });
  }

  const names = ['Warehouse_A', 'Warehouse_B', 'Warehouse_C'];
  const warehouses: Warehouse[] = [];
  for (const name of names) {
    let wh = await whRepo.findOne({ where: { name } });
    if (!wh) {
      wh = await whRepo.save({ name });
    }
    warehouses.push(wh);
  }

  for (let i = 1; i <= 10; i++) {
    const sku = `SKU-${i.toString().padStart(5, '0')}`;
    const exists = await itemRepo.findOne({ where: { sku } });
    if (!exists) {
      await itemRepo.save({
        sku,
        name: `Item ${i}`,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        qty: 0,
      });
    }
  }

  console.log('✅ Seeding completed');
  await dataSource.destroy();
}

seed().catch(async (e) => {
  console.error('❌ Seed failed:', e);
  try {
    await dataSource.destroy();
  } catch {}
});
