import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const PreOrcamentosModel = db.define('pre_orcamentos', {
  id_pre_orcamento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  id_servico: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_requerimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  indexes: [
    {
      name: 'idx_servico',
      fields: ['id_servico'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
