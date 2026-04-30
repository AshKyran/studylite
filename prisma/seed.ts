// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Replicate the production connection pool for the seed script
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Correctly instantiate the client WITH the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding core subjects...');

  const subjects = [
    { name: 'Mathematics', description: 'Calculus, Algebra, Geometry, and Statistics' },
    { name: 'Physics', description: 'Mechanics, Thermodynamics, and Electromagnetism' },
    { name: 'Biology', description: 'Anatomy, Genetics, and Ecology' },
    { name: 'Computer Science', description: 'Programming, Data Structures, and Architecture' },
    { name: 'Business & Economics', description: 'Microeconomics, Macroeconomics, and Finance' },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {}, 
      create: subject,
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });