import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Categories
  const tech = await prisma.category.upsert({ where: { name: 'Tech & Electronics' }, update: {}, create: { name: 'Tech & Electronics' } })
  const clothing = await prisma.category.upsert({ where: { name: 'Clothing' }, update: {}, create: { name: 'Clothing' } })
  const home = await prisma.category.upsert({ where: { name: 'Home & Kitchen' }, update: {}, create: { name: 'Home & Kitchen' } })
  const books = await prisma.category.upsert({ where: { name: 'Books' }, update: {}, create: { name: 'Books' } })
  const groceries = await prisma.category.upsert({ where: { name: 'Groceries' }, update: {}, create: { name: 'Groceries' } })

  // Years
  const y2025 = await prisma.year.upsert({ where: { value: 2025 }, update: {}, create: { value: 2025 } })
  const y2024 = await prisma.year.upsert({ where: { value: 2024 }, update: {}, create: { value: 2024 } })
  const y2023 = await prisma.year.upsert({ where: { value: 2023 }, update: {}, create: { value: 2023 } })

  // Stores
  const amazon = await prisma.store.upsert({ where: { name: 'Amazon' }, update: {}, create: { name: 'Amazon' } })
  const nike = await prisma.store.upsert({ where: { name: 'Nike.com' }, update: {}, create: { name: 'Nike.com' } })
  const keychron = await prisma.store.upsert({ where: { name: 'Keychron' }, update: {}, create: { name: 'Keychron' } })
  const target = await prisma.store.upsert({ where: { name: 'Target' }, update: {}, create: { name: 'Target' } })
  const ikea = await prisma.store.upsert({ where: { name: 'Ikea' }, update: {}, create: { name: 'Ikea' } })
  const bestbuy = await prisma.store.upsert({ where: { name: 'Best Buy' }, update: {}, create: { name: 'Best Buy' } })
  const apple = await prisma.store.upsert({ where: { name: 'Apple' }, update: {}, create: { name: 'Apple' } })
  const uniqlo = await prisma.store.upsert({ where: { name: 'Uniqlo' }, update: {}, create: { name: 'Uniqlo' } })
  const ebay = await prisma.store.upsert({ where: { name: 'Ebay' }, update: {}, create: { name: 'Ebay' } })

  // Items
  const items = [
    {
      title: 'Sony WH-1000XM5',
      image: 'https://via.placeholder.com/600x800/eeeeee/999999?text=Headphones',
      price: 348.00,
      purchaseDate: new Date('2025-01-12'),
      status: 'Shipping',
      storeId: amazon.id,
      yearId: y2025.id,
      categoryId: tech.id,
    },
    {
      title: 'Nike Pegasus 40',
      image: 'https://via.placeholder.com/600x800/e0e0e0/999999?text=Sneakers',
      price: 120.00,
      purchaseDate: new Date('2024-12-20'),
      status: 'Delivered',
      storeId: nike.id,
      yearId: y2024.id,
      categoryId: clothing.id,
    },
    {
      title: 'Keychron K2 Pro',
      image: 'https://via.placeholder.com/600x800/f0f0f0/999999?text=Keyboard',
      price: 89.00,
      purchaseDate: new Date('2024-11-15'),
      status: 'Delivered',
      storeId: keychron.id,
      yearId: y2024.id,
      categoryId: tech.id,
    },
    {
      title: 'Chemex Pour-Over',
      image: 'https://via.placeholder.com/600x800/e5e5e5/999999?text=Coffee+Maker',
      price: 46.50,
      purchaseDate: new Date('2024-10-05'),
      status: 'Delivered',
      storeId: target.id,
      yearId: y2024.id,
      categoryId: home.id,
    },
    {
      title: 'LED Desk Lamp',
      image: 'https://via.placeholder.com/600x800/ededed/999999?text=Desk+Lamp',
      price: 29.99,
      purchaseDate: new Date('2024-09-22'),
      status: 'Returned',
      storeId: ikea.id,
      yearId: y2024.id,
      categoryId: home.id,
    },
    {
      title: 'Nest Thermostat',
      image: 'https://via.placeholder.com/600x800/f5f5f5/999999?text=Thermostat',
      price: 129.00,
      purchaseDate: new Date('2024-08-10'),
      status: 'Delivered',
      storeId: bestbuy.id,
      yearId: y2024.id,
      categoryId: tech.id,
    },
  ]

  for (const item of items) {
     const existing = await prisma.item.findFirst({ where: { title: item.title } })
     if (!existing) {
       await prisma.item.create({ data: item })
     }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
