import { createDB, db } from './config';
import { logger } from '../logs/logger';
import { createTables_v1 } from './create_tables_v1';

export async function checkAndCreateDatabase() {
    try {
        await createDB.authenticate();
        logger.info(`Conectado ao servidor MySQL: ${process.env.HOST}`);

        const [results] = await createDB.query(
            `SHOW DATABASES LIKE ?`, { replacements: [process.env.DATABASE] }
        );

        if (Array.isArray(results) && results.length === 0) {
            logger.warn(`Banco de dados "${process.env.DATABASE}" não existe. Criando...`);

            await createDB.query(`CREATE DATABASE ${process.env.DATABASE}`);
            logger.info(`Banco de dados "${process.env.DATABASE}" criado com sucesso!`);
            await createTables_v1()
            
        } else {
            logger.warn(`Banco de dados "${process.env.DATABASE}" já existe.`);

            const [results] = await db.query(`SHOW TABLES LIKE ?`, { replacements: ['CONTROLES'] });
            if (Array.isArray(results) && results.length === 0) {
                await createTables_v1();
            } else {
                logger.info('Tabelas já sincronizadas.');
            }
        }

        await createDB.close();

    } catch (error) {
        logger.error('Erro ao verificar ou criar banco de dados:', error);
    }
}
