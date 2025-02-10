import { logger } from "../../logs/logger";
import { VeiculosModel } from "../models/veiculos_model";

export const getVeiculos = async () => {
    try {
        logger.info('Buscando todos os veiculos...');
        const veiculos = await VeiculosModel.findAll();

        if (veiculos.every(usuario => usuario instanceof VeiculosModel) && veiculos.length > 0) {
            logger.info("Todos os veiculos foram retornados com sucesso!")
            return veiculos;
        } else {
            logger.warn('Nenhum veiculo encontrado...');
            return 'Nenhum veiculo encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar veiculos:', error);
    }
};

