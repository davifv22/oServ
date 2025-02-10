import { logger } from "../../logs/logger";
import { EmpresaModel } from "../models/empresa_model";

export const getEmpresa = async () => {
    try {
        logger.info('Buscando dados da empresa...');
        const empresa = await EmpresaModel.findAll();

        if (empresa.every(dados => dados instanceof EmpresaModel) && empresa.length > 0) {
            logger.info("Todos os dados da empresa foram retornados com sucesso!")
            return empresa;
        } else {
            logger.warn('Nenhum dado da empresa encontrado...');
            return 'Nenhum dado da empresa encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar dados da empresa:', error);
    }
};

