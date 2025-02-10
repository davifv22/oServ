import { logger } from "../../logs/logger";
import { UsuariosModel } from "../models/usuarios_model";

export const getUsuarios = async () => {
    try {
        logger.info('Buscando todos os usuários...');
        const usuarios = await UsuariosModel.findAll();

        if (usuarios.every(usuario => usuario instanceof UsuariosModel) && usuarios.length > 0) {
            logger.info("Todos os usuários foram retornados com sucesso!")
            return usuarios;
        } else {
            logger.warn('Nenhum usuário encontrado...');
            return 'Nenhum usuário encontrado...';
        }

    } catch (error) {
        logger.error('Erro ao buscar usuários:', error);
    }
};

