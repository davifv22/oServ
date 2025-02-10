import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { SetoresModel } from "./setores_model";

export const EquipesModel = db.define('equipes', {
  id_equipe: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  id_setor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SetoresModel,
      key: 'id_setor',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  indexes: [
    {
      name: 'idx_setor',
      fields: ['id_setor'],
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
