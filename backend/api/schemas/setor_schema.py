from api.app import ma
from ..models import setor_model
from marshmallow import fields

class SetorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = setor_model.SetorModel
        load_instance = True
        fields = ('idSetor', 'descricao', 'situacao')

    descricao = fields.String(required=True)
    situacao = fields.Boolean(required=False)