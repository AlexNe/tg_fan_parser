
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // Подключение к MySQL
        },
    },
});

// Функция проверки и переподключения
async function checkConnection() {
    try {
        await prisma.$connect();
        console.log("✅ MySQL Connected");
    } catch (error) {
        console.error("❌ MySQL Connection Error:", error);
        setTimeout(checkConnection, 5000); // Повтор через 5 сек
    }
}

// Вызываем проверку соединения
checkConnection();

export default prisma;
