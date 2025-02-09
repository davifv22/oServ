import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { RequerimentosModel } from "./requerimentos_model";
import { VeiculosModel } from "./veiculos_model";
import { FuncionariosModel } from "./funcionarios_model";

export const OrdensServicosModel = db.define('ordens_servicos', {
  id_os: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_requerimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: RequerimentosModel,
      key: 'id_requerimento',
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dt_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dt_termino: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dt_cancelamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  id_veiculo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: VeiculosModel,
      key: 'id_veiculo',
    }
  },
  id_funcionario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: FuncionariosModel,
      key: 'id_funcionario',
    }
  },
  km_rodados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  situacao: {
    type: DataTypes.ENUM('EM_ABERTO', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'EM_ABERTO',
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  indexes: [
    {
      name: 'idx_requerimento',
      fields: ['id_requerimento'],
    },
    {
      name: 'idx_veiculo',
      fields: ['id_veiculo'],
    },
    {
      name: 'idx_situacao',
      fields: ['situacao'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
