import { logger } from "../../logs/logger";
import { TiposRequerimentosModel } from "../models/tipos_requerimentos_model";

export const getTiposRequerimentos = async () => {
    try {
        logger.info('Buscando todos os tipos de requerimentos...');
        const tiposRequerimentos = await TiposRequerimentosModel.findAll();

        if (tiposRequerimentos.every(tipo => tipo instanceof TiposRequerimentosModel) && tiposRequerimentos.length > 0) {
            logger.info("Todos os tipos de requerimentos foram retornados com sucesso!")
            return tiposRequerimentos;
        } else {
            logger.warn('Nenhum tipo de requerimento encontrado...');
            return 'Nenhum tipo de requerimento encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar tipos de requerimentos:', error);
    }
};

