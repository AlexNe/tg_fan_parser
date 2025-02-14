// declare module "*.json" {
//     const value: any;
//     export default value;
// }

interface Config {
    // Определите здесь структуру вашего конфига
    database: {
        host: string;
        port: number;
    };
    // другие поля...
}


import config from '../../config.json';

export default config
// const config: Config = require('../../config.json');