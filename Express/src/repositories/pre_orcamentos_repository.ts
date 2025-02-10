import { logger } from "../../logs/logger";
import { PreOrcamentosModel } from "../models/pre_orcamentos_model";

export const getPreOrcamentos = async () => {
    try {
        logger.info('Buscando todos os pré orcamentos...');
        const preOrcamentos = await PreOrcamentosModel.findAll();

        if (preOrcamentos.every(preOrcamento => preOrcamento instanceof PreOrcamentosModel) && preOrcamentos.length > 0) {
            logger.info("Todos os pré orcamentos foram retornados com sucesso!")
            return preOrcamentos;
        } else {
            logger.warn('Nenhum pré orcamento encontrado...');
            return 'Nenhum pré orcamento encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar pré orcamentos:', error);
    }
};

