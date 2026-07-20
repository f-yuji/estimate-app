import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log({
    users: await prisma.user.count(),
    categories: await prisma.workCategory.count(),
    quantitySources: await prisma.quantitySourceMaster.count(),
    workItems: await prisma.workItemMaster.count(),
  });
}

main().finally(() => prisma.$disconnect());
