from api.app import ma
from ..models import equipe_model
from marshmallow import fields

class EquipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = equipe_model.EquipeModel
        load_instance = True
        fields = ('idEquipe', 'descricao', 'idSetor', 'situacao')

    descricao = fields.String(required=True)
    idSetor = fields.String(required=True)
    situacao = fields.String(required=False)