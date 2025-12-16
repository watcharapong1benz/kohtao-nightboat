const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: adminPassword,
            name: 'ผู้ดูแลระบบ',
            role: 'ADMIN'
        },
        create: {
            username: 'admin',
            password: adminPassword,
            name: 'ผู้ดูแลระบบ',
            role: 'ADMIN'
        }
    });
    console.log('✅ Created admin user:', admin.username);

    // Create Staff User
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await prisma.user.upsert({
        where: { username: 'staff' },
        update: {
            password: staffPassword,
            name: 'พนักงานขาย',
            role: 'STAFF'
        },
        create: {
            username: 'staff',
            password: staffPassword,
            name: 'พนักงานขาย',
            role: 'STAFF'
        }
    });
    console.log('✅ Created staff user:', staff.username);

    // Create sample tickets
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticket1 = await prisma.ticket.create({
        data: {
            passengerName: 'สมชาย ใจดี',
            phone: '081-234-5678',
            route: 'SURAT_TO_KOHTAO',
            seatNumber: 'A1',
            seatLayout: 'LAYOUT_50',
            price: 500,
            travelDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
            sellerId: admin.id
        }
    });
    console.log('✅ Created sample ticket:', ticket1.id);

    // Create sample parcel
    const parcel1 = await prisma.parcel.create({
        data: {
            senderName: 'สมหญิง รักดี',
            senderPhone: '082-345-6789',
            receiverName: 'สมศักดิ์ มีสุข',
            receiverPhone: '083-456-7890',
            weight: 5.5,
            price: 55,
            status: 'WAITING',
            paymentStatus: 'PAID',
            depositDate: today,
            sellerId: staff.id
        }
    });
    console.log('✅ Created sample parcel:', parcel1.id);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin - username: admin, password: admin123');
    console.log('Staff - username: staff, password: staff123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
