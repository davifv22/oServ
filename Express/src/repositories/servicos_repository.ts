import { logger } from "../../logs/logger";
import { ServicosModel } from "../models/servicos_model";

export const getServicos = async () => {
    try {
        logger.info('Buscando todos os servicos...');
        const servicos = await ServicosModel.findAll();

        if (servicos.every(servico => servico instanceof ServicosModel) && servicos.length > 0) {
            logger.info("Todos os servicos foram retornados com sucesso!")
            return servicos;
        } else {
            logger.warn('Nenhum servico encontrado...');
            return 'Nenhum servico encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar servicos:', error);
    }
};

