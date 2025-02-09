import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const EmpresaModel = db.define('empresa', {
  id_empresa: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome_empresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dt_ref_sistema: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cep: {
    type: DataTypes.CHAR(8),
    allowNull: false,
  },
  num: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cpf_cnpj: {
    type: DataTypes.CHAR(14),
    allowNull: false,
  },
}, {
  indexes: [
    {
      name: 'idx_nome',
      fields: ['nome_empresa'],
    },
    {
      name: 'idx_cpf_cnpj',
      fields: ['cpf_cnpj'],
    },
  ],
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
