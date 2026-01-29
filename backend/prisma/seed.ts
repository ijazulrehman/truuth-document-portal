import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {
      passwordHash,
    },
    create: {
      username: 'testuser',
      passwordHash,
    },
  });

  console.log('✅ Created test user:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log('');

  // Create a second test user
  const passwordHash2 = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: passwordHash2,
    },
    create: {
      username: 'admin',
      passwordHash: passwordHash2,
    },
  });

  console.log('✅ Created admin user:');
  console.log(`   ID: ${adminUser.id}`);
  console.log(`   Username: ${adminUser.username}`);
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('       DATABASE SEEDED SUCCESSFULLY!        ');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('Test Credentials:');
  console.log('  Username: testuser');
  console.log('  Password: password123');
  console.log('');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('');

  // Create ijaz users (ijaz, ijaz1 ... ijaz6)
const ijazPasswordHash = await bcrypt.hash('password123', 12);

const ijazUsers = ['ijaz', 'ijaz1', 'ijaz2', 'ijaz3', 'ijaz4', 'ijaz5', 'ijaz6'];

for (const username of ijazUsers) {
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash: ijazPasswordHash,
    },
    create: {
      username,
      passwordHash: ijazPasswordHash,
    },
  });

  console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);
}

console.log('');
console.log('Ijaz Users Credentials:');
console.log('  Password (all): password123');
console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
