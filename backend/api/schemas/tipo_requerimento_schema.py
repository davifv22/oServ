from api.app import ma
from ..models import tipo_requerimento_model
from marshmallow import fields

class TipoRequerimentoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = tipo_requerimento_model.TipoRequerimentoModel
        load_instance = True
        fields = ('idTipoRequerimento', 'descricao', 'emiteOrcamento', 'emiteOS', 'situacao')

    descricao = fields.String(required=True)
    emiteOrcamento = fields.Boolean(required=True)
    emiteOS = fields.Boolean(required=True)
    situacao = fields.Boolean(required=False)
