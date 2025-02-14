import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { TransformableInfo } from 'logform';
import config from './config';

// Определяем интерфейс для формата лога
interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
}

// Определяем формат логов с типизацией
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info: TransformableInfo) => {
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    })
);
// Конфигурация логгера
const logger = createLogger({
    level: config.logger.level,
    format: logFormat,
    transports: [
        new transports.Console(),  // Вывод в консоль
        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',  // Формат имени файла
            datePattern: 'YYYY-MM-DD',         // Ежедневная ротация
            zippedArchive: true,               // Архивация старых логов в .gz
            maxSize: '10m',                     // Максимальный размер одного файла
            maxFiles: '14d'                      // Хранить логи за последние 14 дней
        })
    ]
});

// Обработчик ошибок при логировании
logger.on('error', (err: any) => {
    console.error('Ошибка логирования:', err);
});

export { logger }