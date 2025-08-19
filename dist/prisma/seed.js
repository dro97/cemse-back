"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
    const superAdmin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: client_1.UserRole.SUPERADMIN,
            isActive: true,
        },
    });
    console.log('✅ Super admin created:', superAdmin.username);
    const sampleUsers = [
        { username: 'jovenes1', password: 'password123', role: client_1.UserRole.YOUTH },
        { username: 'adolescentes1', password: 'password123', role: client_1.UserRole.ADOLESCENTS },
        { username: 'empresa1', password: 'password123', role: client_1.UserRole.COMPANIES },
        { username: 'gobierno1', password: 'password123', role: client_1.UserRole.MUNICIPAL_GOVERNMENTS },
        { username: 'centro1', password: 'password123', role: client_1.UserRole.TRAINING_CENTERS },
        { username: 'ong1', password: 'password123', role: client_1.UserRole.NGOS_AND_FOUNDATIONS },
    ];
    for (const userData of sampleUsers) {
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        await prisma.user.upsert({
            where: { username: userData.username },
            update: {},
            create: {
                username: userData.username,
                password: hashedPassword,
                role: userData.role,
                isActive: true,
            },
        });
    }
    console.log('✅ Sample users created');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('Super Admin: admin / admin123');
    console.log('Sample Users:');
    sampleUsers.forEach(user => {
        console.log(`  ${user.role}: ${user.username} / ${user.password}`);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map