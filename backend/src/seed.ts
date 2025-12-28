import 'dotenv/config';
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding database...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Admin user with person profile
    const admin = await prisma.user.upsert({
        where: { email: 'admin@barangay.gov.ph' },
        update: { emailVerified: true, isActive: true },
        create: {
            email: 'admin@barangay.gov.ph',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
            person: {  // Changed from resident
                create: {
                    firstName: 'Juan',
                    lastName: 'Administrator',
                    birthDate: new Date('1985-01-15'),
                    gender: 'MALE',
                    civilStatus: 'MARRIED',
                    address: 'Barangay Hall, Main Street',
                    nationality: 'Filipino'
                }
            }
        },
        include: { person: true }
    });
    console.log(`✅ Created Admin: ${admin.email}`);

    // Create Staff user with person profile
    const staff = await prisma.user.upsert({
        where: { email: 'staff@barangay.gov.ph' },
        update: { emailVerified: true, isActive: true },
        create: {
            email: 'staff@barangay.gov.ph',
            password: hashedPassword,
            role: 'STAFF',
            isActive: true,
            emailVerified: true,
            person: {  // Changed from resident
                create: {
                    firstName: 'Maria',
                    lastName: 'Santos',
                    birthDate: new Date('1990-05-20'),
                    gender: 'FEMALE',
                    civilStatus: 'SINGLE',
                    address: '123 Sample Street, Purok 1',
                    nationality: 'Filipino'
                }
            }
        },
        include: { person: true }
    });
    console.log(`✅ Created Staff: ${staff.email}`);

    // Create Resident user with person profile
    const residentUser = await prisma.user.upsert({
        where: { email: 'resident@gmail.com' },
        update: { emailVerified: true, isActive: true },
        create: {
            email: 'resident@gmail.com',
            password: hashedPassword,
            role: 'RESIDENT',
            isActive: true,
            emailVerified: true,
            person: {  // Changed from resident
                create: {
                    firstName: 'Pedro',
                    lastName: 'Reyes',
                    birthDate: new Date('1995-08-10'),
                    gender: 'MALE',
                    civilStatus: 'SINGLE',
                    address: '456 Another Street, Purok 2',
                    nationality: 'Filipino'
                }
            }
        },
        include: { person: true }
    });
    console.log(`✅ Created Resident: ${residentUser.email}`);

    console.log('\n🎉 Seeding completed!');
    console.log('\n📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('| Role     | Email                    | Password    |');
    console.log('|----------|--------------------------|-------------|');
    console.log('| ADMIN    | admin@barangay.gov.ph    | password123 |');
    console.log('| STAFF    | staff@barangay.gov.ph    | password123 |');
    console.log('| RESIDENT | resident@gmail.com       | password123 |');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
