import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  //limpiar base de datos
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  // Crear usuario administrador
  const admin = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: bcrypt.hashSync('Abc12345', 10),
      name: 'Testeador',
      businessName:'Mi kiosquito',
      },
  });

  // Crear algunas categorías base
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Bebidas',userId: admin.id },
      { name: 'Articulos de limpieza', userId: admin.id },
      { name: 'Fiambres', userId: admin.id },
      { name: 'Lacteos', userId: admin.id },
    ],
  });

  // Crear algunas marcas
  const brands = await prisma.brand.createMany({
    data: [
      { name: 'Coca-Cola', userId: admin.id },
      { name: 'Pepsi', userId: admin.id },
      { name: 'Nestlé',userId: admin.id },
      { name: 'P&G', userId: admin.id },
    ],
  });

  // Crear algunos productos de ejemplo
  await prisma.product.createMany({
    data: [
      {
        name: 'Coca-Cola 2L',
        brandId: (await prisma.brand.findFirst({ where: { name: 'Coca-Cola', userId: admin.id } }))?.id!,
        description: 'Botella de Coca-Cola 2 litros',
        minStock: 10,
        currentStock: 50,
        unitMeasure: 'UNIT',
        costPrice: 1.500,
        salePrice: 2.500,
        profitMargin: 40,
        userId: admin.id,
        barcode: '7790895000996',
        categoryId: (await prisma.category.findFirst({ where: { name: 'Bebidas', userId: admin.id } }))?.id,
      },
      {
        name: 'Pepsi 2L',
        brandId: (await prisma.brand.findFirst({ where: { name: 'Pepsi', userId: admin.id } }))?.id!,
        description: 'Botella de Pepsi 2 litros',
        minStock: 10,
        currentStock: 45,
        unitMeasure: 'UNIT',
        costPrice: 1.400,
        salePrice: 2.300,
        profitMargin: 39,
        userId: admin.id,
        barcode: '7790895000997',
        categoryId: (await prisma.category.findFirst({ where: { name: 'Bebidas', userId: admin.id } }))?.id,
      },
    ],
  });

  console.log('Seed ejecutado con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });