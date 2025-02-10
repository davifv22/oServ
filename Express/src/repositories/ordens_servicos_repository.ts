import { logger } from "../../logs/logger";
import { OrdensServicosModel } from "../models/ordens_servicos_model";

export const getOrdensServicos = async () => {
    try {
        logger.info('Buscando todos os ordens de serviços...');
        const ordensServicos = await OrdensServicosModel.findAll();

        if (ordensServicos.every(ordensServico => ordensServico instanceof OrdensServicosModel) && ordensServicos.length > 0) {
            logger.info("Todos os ordens de serviços foram retornadas com sucesso!")
            return ordensServicos;
        } else {
            logger.warn('Nenhuma ordens de serviços encontrada...');
            return 'Nenhuma ordens de serviços encontrada...';
        }

    } catch (error) {
        logger.error('Erro ao buscar ordens de serviços:', error);
    }
};

