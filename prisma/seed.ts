import 'dotenv/config';
import { PrismaClient } from 'src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
const adapter = new PrismaMariaDb(
    {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'quanlythuedo',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '5')
    },
)
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Seeding Started ---');

    // 1. Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminEmail = 'nmhung151299@gmail.com';

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: adminPassword },
        create: {
            email: adminEmail,
            password: adminPassword,
            name: 'System Admin',
            role: 'admin',
        },
    });
    console.log('✅ Admin user seeded:', admin.email);

    // 2. Default Branch
    const branch = await prisma.branch.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Fashion Hub - Ho Chi Minh City',
            address: '123 Nguyen Hue, District 1, HCM',
        },
    });
    console.log('✅ Default branch seeded:', branch.name);

    // 3. Categories
    const categories = [
        { id: 1, name: 'Traditional Ao Dai' },
        { id: 2, name: 'Wedding Ao Dai' },
        { id: 3, name: 'Modern Ao Dai' },
        { id: 4, name: 'Accessories' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: {},
            create: cat,
        });
    }
    console.log('✅ Categories seeded');

    // 4. Products
    const products = [
        {
            id: 1,
            name: 'Royal Red Wedding Ao Dai',
            description: 'Elegant silk Ao Dai with gold embroidery.',
            basePrice: 50.00,
            categoryId: 2,
        },
        {
            id: 2,
            name: 'Simple White Silk Ao Dai',
            description: 'Classical white Ao Dai for students and daily wear.',
            basePrice: 20.00,
            categoryId: 1,
        },
        {
            id: 3,
            name: 'Lotus Blue Modern Ao Dai',
            description: 'Short sleeve modern Ao Dai with lotus patterns.',
            basePrice: 35.00,
            categoryId: 3,
        },
    ];

    for (const prod of products) {
        await prisma.product.upsert({
            where: { id: prod.id },
            update: {},
            create: prod,
        });
    }
    console.log('✅ Products seeded');

    // 5. Product Items (Physical items with codes)
    const productItems = [
        {
            itemCode: 'RWD-001-L',
            productId: 1,
            branchId: 1,
            status: 'available',
            condition: 'New',
        },
        {
            itemCode: 'RWD-002-M',
            productId: 1,
            branchId: 1,
            status: 'available',
            condition: 'Slightly Used',
        },
        {
            itemCode: 'SWS-001-S',
            productId: 2,
            branchId: 1,
            status: 'available',
            condition: 'New',
        },
        {
            itemCode: 'LBM-001-M',
            productId: 3,
            branchId: 1,
            status: 'available',
            condition: 'Excellent',
        },
    ];

    for (const item of productItems) {
        await prisma.productItem.upsert({
            where: { itemCode: item.itemCode },
            update: {},
            create: {
                itemCode: item.itemCode,
                status: item.status as any,
                condition: item.condition,
                product: { connect: { id: item.productId } },
                branch: { connect: { id: item.branchId } },
            },
        });
    }
    console.log('✅ Product items seeded');

    console.log('--- Seeding Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
