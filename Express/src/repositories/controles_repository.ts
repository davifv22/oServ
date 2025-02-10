import { logger } from "../../logs/logger";
import { ControlesModel } from "../models/controles_model";

export const getControles = async () => {
    try {
        logger.info('Buscando controles...');
        const controles = await ControlesModel.findAll();

        if (controles.every(controle => controle instanceof ControlesModel) && controles.length > 0) {
            logger.info("Os controles foram retornados com sucesso!")
            return controles;
        } else {
            logger.warn('Nenhum controle encontrado...');
            return 'Nenhum controle encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar controles:', error);
    }
};

