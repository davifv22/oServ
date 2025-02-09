import { Sequelize } from 'sequelize';
import { logger } from '../logs/logger';

export const createDB = new Sequelize({
    host: process.env.HOST,
    dialect: 'mysql',
    username: process.env.USER,
    password: process.env.PASSWORD,
    logging: msg => logger.info(msg),
});

export const db = new Sequelize({
    host: process.env.HOST,
    dialect: 'mysql',
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    logging: msg => logger.info(msg),
});
