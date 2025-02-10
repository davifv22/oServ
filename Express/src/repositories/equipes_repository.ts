import { logger } from "../../logs/logger";
import { EquipesModel } from "../models/equipes_model";

export const getEquipes = async () => {
    try {
        logger.info('Buscando todos os equipes...');
        const equipes = await EquipesModel.findAll();

        if (equipes.every(equipe => equipe instanceof EquipesModel) && equipes.length > 0) {
            logger.info("Todos os equipes foram retornados com sucesso!")
            return equipes;
        } else {
            logger.warn('Nenhum equipe encontrado...');
            return 'Nenhum equipe encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar equipes:', error);
    }
};

