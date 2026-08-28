const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mowerrepairpro.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@mowerrepairpro.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '555-0100',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create a sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'john@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '555-0200',
      address: '123 Elm Street',
    },
  });
  console.log('Customer created:', customer.email);

  // Create a sample mower
  const mower = await prisma.mower.create({
    data: {
      customerId: customer.id,
      make: 'John Deere',
      model: 'X350',
      year: 2022,
      serialNumber: 'JD-X350-2022-001',
      notes: 'Riding mower, 42-inch deck',
    },
  });
  console.log('Mower created:', mower.make, mower.model);

  // Create a sample repair job
  const job = await prisma.repairJob.create({
    data: {
      mowerId: mower.id,
      customerId: customer.id,
      description: 'Engine won\'t start, makes clicking noise when turning key',
      status: 'SUBMITTED',
    },
  });
  console.log('Repair job created:', job.id);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
