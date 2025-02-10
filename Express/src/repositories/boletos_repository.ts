import { logger } from "../../logs/logger";
import { BoletosModel } from "../models/boletos_model";

export const getBoletos = async () => {
    try {
        logger.info('Buscando todos os boletos...');
        const boletos = await BoletosModel.findAll();

        if (boletos.every(boleto => boleto instanceof BoletosModel) && boletos.length > 0) {
            logger.info("Todos os boletos foram retornados com sucesso!")
            return boletos;
        } else {
            logger.warn('Nenhum boleto encontrado...');
            return 'Nenhum boleto encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar boletos:', error);
    }
};

