import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const UsuariosModel = db.define('usuarios', {
  id_user: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  cpf_cnpj: {
    type: DataTypes.CHAR(14),
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
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  api_key: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
},{
  timestamps: true,
  createdAt: 'dt_criacao',
  updatedAt: 'dt_atualizacao',
});
