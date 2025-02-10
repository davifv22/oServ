import { Op } from 'sequelize';
import { ControlesModel } from '../src/models/controles_model';
import { db } from './config';
import { createTables_v1 } from './create_tables_v1';
import { logger } from '../logs/logger';

export async function versionControl() {
    logger.info('Verificando compatibiliade da versão do sistema com o banco de dados!');
    
    const fs = require('fs');
    const path = require('path');

    logger.info('Buscando versão do sistema!');
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

    logger.info('Buscando versão do banco de dados!');
    const versaoDB = await ControlesModel.findOne({
        where: {id: {[Op.eq]: 1,},},
        attributes: ['versao_sistema'],
    });

    if (packageJson.version === '1.0.0') {
        if (versaoDB?.dataValues?.versao_sistema === packageJson.version) {
            logger.info(`O banco de dados já está na mesma versão que o sistema: ${packageJson.version}`);
        } else {
            createTables_v1()
        }
    } else {
        logger.error('Versão não encontrada!');
    }
}
