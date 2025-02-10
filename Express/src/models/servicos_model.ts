import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const ServicosModel = db.define('servicos', {
  id_servico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('MANUTENCAO', 'INSTALACAO', 'SUPORTE', 'OUTROS'),
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
      name: 'idx_tipo',
      fields: ['tipo'],
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
