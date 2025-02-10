import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const SetoresModel = db.define('setores', {
  id_setor: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descricao: {
    type: DataTypes.STRING(100),
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
      name: 'idx_situacao',
      fields: ['situacao'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
