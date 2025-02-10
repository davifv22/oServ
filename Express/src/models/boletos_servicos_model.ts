import { DataTypes } from "sequelize";
import { db } from "../../db/config";
import { ServicosModel } from "./servicos_model";
import { BoletosModel } from "./boletos_model";

export const BoletosServicosModel = db.define('boletos_servicos', {
    id_servico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: ServicosModel,
            key: 'id_servico',
        }
    },
    id_boleto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BoletosModel,
            key: 'id_boleto',
        }
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    dt_estorno: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dt_inclusao: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dt_vencimento: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    complemento: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    situacao: {
        type: DataTypes.ENUM('PENDENTE', 'ESTORNADO', 'INCLUIDO', 'PAGO', 'CANCELADO'),
        allowNull: false,
    },
}, {
    indexes: [
        {
            name: 'idx_vencimento',
            fields: ['dt_vencimento'],
        },
    ],
    timestamps: true,
    createdAt: 'dt_criacao',
    updatedAt: 'dt_atualizacao',
});
