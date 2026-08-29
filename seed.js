const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create category
  const category = await prisma.serviceCategory.create({
    data: {
      name: "General Repair",
    },
  });
  console.log("Created category:", category);

  // Create services
  const services = [
    {
      name: "Spring Maintenance",
      description: "Complete spring tune-up and maintenance package",
      price: 89.99,
      duration: 90,
      categoryId: category.id,
    },
    {
      name: "Engine Repair",
      description: "Expert engine repair and diagnostics",
      price: 149.99,
      duration: 120,
      categoryId: category.id,
    },
    {
      name: "Oil Change",
      description: "Quick oil change and filter replacement",
      price: 49.99,
      duration: 45,
      categoryId: category.id,
    },
    {
      name: "Blade Sharpening",
      description: "Professional blade sharpening service",
      price: 39.99,
      duration: 30,
      categoryId: category.id,
    },
    {
      name: "Winterization",
      description: "Prepare your equipment for winter storage",
      price: 79.99,
      duration: 60,
      categoryId: category.id,
    },
  ];

  for (const service of services) {
    const created = await prisma.service.create({ data: service });
    console.log("Created service:", created.name);
  }
  
  console.log("\nDatabase seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
