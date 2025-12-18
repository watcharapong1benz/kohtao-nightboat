const { initializeFirebase } = require('./firebaseConfig');
const bcrypt = require('bcryptjs');

const db = initializeFirebase();

async function main() {
    console.log('🌱 Starting Firestore database seed...');

    try {
        // Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminRef = db.collection('users').doc('admin');
        await adminRef.set({
            username: 'admin',
            password: adminPassword,
            name: 'ผู้ดูแลระบบ',
            role: 'ADMIN',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Created admin user: admin');

        // Create Staff User
        const staffPassword = await bcrypt.hash('staff123', 10);
        const staffRef = db.collection('users').doc('staff');
        await staffRef.set({
            username: 'staff',
            password: staffPassword,
            name: 'พนักงานขาย',
            role: 'STAFF',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Created staff user: staff');

        // Create sample tickets
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const ticket1Ref = db.collection('tickets').doc();
        await ticket1Ref.set({
            passengerName: 'สมชาย ใจดี',
            phone: '081-234-5678',
            route: 'SURAT_TO_KOHTAO',
            seatNumber: 'A1',
            seatLayout: 'LAYOUT_50',
            price: 500,
            travelDate: tomorrow.toISOString(),
            sellerId: 'admin',
            sellerName: 'ผู้ดูแลระบบ',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Created sample ticket:', ticket1Ref.id);

        // Create sample parcel
        const parcel1Ref = db.collection('parcels').doc();
        await parcel1Ref.set({
            senderName: 'สมหญิง รักดี',
            senderPhone: '082-345-6789',
            receiverName: 'สมศักดิ์ มีสุข',
            receiverPhone: '083-456-7890',
            weight: 5.5,
            price: 55,
            status: 'WAITING',
            paymentStatus: 'PAID',
            depositDate: today.toISOString(),
            sellerId: 'staff',
            sellerName: 'พนักงานขาย',
            createdAt: new Date().toISOString()
        });
        console.log('✅ Created sample parcel:', parcel1Ref.id);

        console.log('🎉 Firestore database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('Admin - username: admin, password: admin123');
        console.log('Staff - username: staff, password: staff123');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
