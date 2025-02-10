import { logger } from "../../logs/logger";
import { BoletosServicosModel } from "../models/boletos_servicos_model";

export const getBoletosServicos = async () => {
    try {
        logger.info('Buscando todos os serviços dos boletos...');
        const boletosServicos = await BoletosServicosModel.findAll();

        if (boletosServicos.every(boletoServico => boletoServico instanceof BoletosServicosModel) && boletosServicos.length > 0) {
            logger.info("Todos os serviços dos boletos foram retornados com sucesso!")
            return boletosServicos;
        } else {
            logger.warn('Nenhum serviço de boleto encontrado...');
            return 'Nenhum serviço de boleto encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar os serviços dos boletos:', error);
    }
};

