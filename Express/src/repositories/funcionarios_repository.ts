import { logger } from "../../logs/logger";
import { FuncionariosModel } from "../models/funcionarios_model";

export const getFuncionarios = async () => {
    try {
        logger.info('Buscando todos os funcionarios...');
        const funcionarios = await FuncionariosModel.findAll();

        if (funcionarios.every(funcionario => funcionario instanceof FuncionariosModel) && funcionarios.length > 0) {
            logger.info("Todos os funcionarios foram retornados com sucesso!")
            return funcionarios;
        } else {
            logger.warn('Nenhum funcionario encontrado...');
            return 'Nenhum funcionario encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar funcionarios:', error);
    }
};

