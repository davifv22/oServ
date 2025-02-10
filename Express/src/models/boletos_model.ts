import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { ClientesModel } from "./clientes_model";
import { RequerimentosModel } from "./requerimentos_model";

export const BoletosModel = db.define('boletos', {
    id_boleto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    id_requerimento: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: {
            model: RequerimentosModel,
            key: 'id_requerimento',
        }
    },
    valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    dt_vencimento: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dt_baixa: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ClientesModel,
            key: 'id_cliente',
        }
    },
    situacao: {
        type: DataTypes.ENUM('PENDENTE', 'PAGO', 'CANCELADO'),
        allowNull: false,
    },
}, {
    indexes: [
        {
            name: 'idx_boleto',
            fields: ['id_boleto'],
        },
        {
            name: 'idx_requerimento',
            fields: ['id_requerimento'],
        },
        {
            name: 'idx_cliente',
            fields: ['id_cliente'],
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
