import { db } from './config';
import { UsuariosModel } from '../src/models/usuarios_model';
import { SetoresModel } from '../src/models/setores_model';
import { EquipesModel } from '../src/models/equipes_model';
import { FuncionariosModel } from '../src/models/funcionarios_model';
import { EmpresaModel } from '../src/models/empresa_model';
import { ServicosModel } from '../src/models/servicos_model';
import { TiposRequerimentosModel } from '../src/models/tipos_requerimentos_model';
import { PreOrcamentosModel } from '../src/models/pre_orcamentos_model';
import { RequerimentosModel } from '../src/models/requerimentos_model';
import { OrdensServicosModel } from '../src/models/ordens_servicos_model';
import { ClientesModel } from '../src/models/clientes_model';
import { BoletosModel } from '../src/models/boletos_model';
import { BoletosServicosModel } from '../src/models/boletos_servicos_model';
import { VeiculosModel } from '../src/models/veiculos_model';
import { logger } from '../logs/logger';
import { ControlesModel } from '../src/models/controles_model';

// Função para sincronizar as tabelas com o banco de dados
export const createTables_v1 = async () => {
    try {
        logger.info('Criando tabelas...');

        ControlesModel
        EmpresaModel
        UsuariosModel
        SetoresModel
        EquipesModel
        FuncionariosModel
        ServicosModel
        TiposRequerimentosModel
        ClientesModel
        VeiculosModel
        PreOrcamentosModel
        RequerimentosModel
        OrdensServicosModel
        BoletosModel
        BoletosServicosModel

        await db.sync({alter: false});

        await ControlesModel.create({versao_sistema: '1.0.0'});

        logger.info('Tabelas sincronizadas com sucesso!');
        // await UsuariosModel.create({
        //     user: 'jane_doe', // Nome de usuário
        //     nome: 'Jane Doe', // Nome completo
        //     email: 'jane.doe@example.com', // E-mail
        //     cpf_cnpj: '12345678901234', // CPF/CNPJ
        //     cep: '12345678', // CEP
        //     num: 123, // Número
        //     senha: 'senha123', // Senha que será criptografada
        //     situacao: 'ATIVO', // Situação
        //     is_admin: false, // Se é admin ou não
        //     api_key: 'api-key-unique', // API Key
        // });

    } catch (error) {
        logger.error('Erro ao criar tabelas:', error);
    }
};
