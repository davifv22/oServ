import { logger } from "../../logs/logger";
import { ClientesModel } from "../models/clientes_model";

export const getClientes = async () => {
    try {
        logger.info('Buscando todos os clientes...');
        const clientes = await ClientesModel.findAll();

        if (clientes.every(cliente => cliente instanceof ClientesModel) && clientes.length > 0) {
            logger.info("Todos os clientes foram retornados com sucesso!")
            return clientes;
        } else {
            logger.warn('Nenhum cliente encontrado...');
            return 'Nenhum cliente encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar clientes:', error);
    }
};

