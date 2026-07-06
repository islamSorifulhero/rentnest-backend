import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentnest.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'RentNest Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('ℹ️ Admin already exists, skipping.');
  }

  const categories = ['Apartment', 'House', 'Studio', 'Condo', 'Villa'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Categories seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
