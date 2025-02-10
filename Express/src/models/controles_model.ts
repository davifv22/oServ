import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const ControlesModel = db.define('controles', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  versao_sistema: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});