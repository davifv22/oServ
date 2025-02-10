import { logger } from "../../logs/logger";
import { RequerimentosModel } from "../models/requerimentos_model";

export const getRequerimentos = async () => {
    try {
        logger.info('Buscando todos os requerimentos...');
        const requerimentos = await RequerimentosModel.findAll();

        if (requerimentos.every(requerimento => requerimento instanceof RequerimentosModel) && requerimentos.length > 0) {
            logger.info("Todos os requerimentos foram retornados com sucesso!")
            return requerimentos;
        } else {
            logger.warn('Nenhum requerimento encontrado...');
            return 'Nenhum requerimento encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar requerimentos:', error);
    }
};

