import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const VeiculosModel = db.define('veiculos', {
  id_veiculo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  placa: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false,
  },
  km_rodados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  dt_ult_manutencao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'MANUTENCAO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  indexes: [
    {
      name: 'idx_placa',
      fields: ['placa'],
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
