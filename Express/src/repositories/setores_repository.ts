import { logger } from "../../logs/logger";
import { SetoresModel } from "../models/setores_model";

export const getSetores = async () => {
    try {
        logger.info('Buscando todos os setores...');
        const setores = await SetoresModel.findAll();

        if (setores.every(setor => setor instanceof SetoresModel) && setores.length > 0) {
            logger.info("Todos os setores foram retornados com sucesso!")
            return setores;
        } else {
            logger.warn('Nenhum setor encontrado...');
            return 'Nenhum setor encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar setores:', error);
    }
};

