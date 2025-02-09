import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const TiposRequerimentosModel = db.define('tipos_requerimentos', {
  id_tipo_requerimento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  emite_orcamento: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  emite_os: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  }
}, {
  indexes: [
    {
      name: 'idx_situacao',
      fields: ['situacao'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
