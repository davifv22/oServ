import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { UsuariosModel } from './usuarios_model';
import { EquipesModel } from './equipes_model';

export const FuncionariosModel = db.define('funcionarios', {
  id_funcionario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UsuariosModel,
      key: 'id_user',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  id_equipe: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: EquipesModel,
      key: 'id_equipe',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  situacao: {
    type: DataTypes.ENUM('ATIVO', 'INATIVO'),
    allowNull: false,
    defaultValue: 'ATIVO',
  },
}, {
  indexes: [
    {
      name: 'idx_equipe',
      fields: ['id_equipe'],
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
