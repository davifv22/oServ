from api.app import ma
from ..models import pre_orcamento_model
from marshmallow import fields

class PreOrcamentoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = pre_orcamento_model.PreOrcamentoModel
        load_instance = True
        fields = ('idTipoRequerimento', 'idServico', 'valor')

    idTipoRequerimento = fields.Integer(required=True)
    idServico = fields.Integer(required=True)
    valor = fields.String(required=True)