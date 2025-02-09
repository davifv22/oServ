import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { TiposRequerimentosModel } from "./tipos_requerimentos_model";
import { FuncionariosModel } from "./funcionarios_model";
import { ClientesModel } from "./clientes_model";

// Modelo Requerimentos
export const RequerimentosModel = db.define('requerimentos', {
  id_requerimento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nome_requerente: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  cep_requerente: {
    type: DataTypes.CHAR(8),
    allowNull: false,
  },
  num_requerente: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cep_servico: {
    type: DataTypes.CHAR(8),
    allowNull: false,
  },
  num_servico: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cpf_cnpj: {
    type: DataTypes.CHAR(14),
    allowNull: false,
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ClientesModel,
      key: 'id_cliente',
    },
  },
  id_funcionario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: FuncionariosModel,
      key: 'id_funcionario',
    },
  },
  tipo_requerimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TiposRequerimentosModel,
      key: 'id_tipo_requerimento'
    },
  },
  observacao: {
    type: DataTypes.TEXT,
  },
  situacao: {
    type: DataTypes.ENUM('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
    allowNull: false,
    defaultValue: 'ABERTO',
  },
}, {
  indexes: [
    {
      name: 'idx_cliente',
      fields: ['id_cliente'],
    },
    {
      name: 'idx_situacao',
      fields: ['situacao'],
    },
    {
      name: 'idx_tipo',
      fields: ['tipo_requerimento'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
