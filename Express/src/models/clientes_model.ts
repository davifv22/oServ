import { DataTypes } from "sequelize";
import { db } from "../../db/config";

export const ClientesModel = db.define('clientes', {
    id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING(20),
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
    situacao: {
        type: DataTypes.ENUM('ATIVO', 'INATIVO'),
        allowNull: false,
        defaultValue: 'ATIVO',
    },
    observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    indexes: [
        {
            name: 'idx_nome',
            fields: ['nome'],
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
