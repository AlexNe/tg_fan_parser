import { App } from './app';
import { logger } from './app/logger';
require('dotenv').config()

const app = new App();

process.on('SIGINT', () => {
    logger.info('Выключение сервера...');
    app.stop()
    process.exit();
});

app.start();