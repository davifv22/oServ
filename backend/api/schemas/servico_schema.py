from api.app import ma
from ..models import servico_model
from marshmallow import fields

class ServicoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = servico_model.ServicoModel
        load_instance = True
        fields = ('idServico', 'descricao', 'tipo', 'valor', 'situacao')

    descricao = fields.String(required=True)
    tipo = fields.Integer(required=True)
    valor = fields.String(required=True)
    situacao = fields.Boolean(required=True)