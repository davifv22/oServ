from api.app import ma
from ..models import funcionario_model
from marshmallow import fields
from ..schemas import usuario_schema

class FuncionarioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = funcionario_model.FuncionarioModel
        load_instance = True
        fields = ('idFuncionario', 'idUser', 'nome', 'idEquipe', 'situacao')

    idUser = fields.Integer(required=True)
    nome = fields.String(required=True)
    idEquipe = fields.Integer(required=True)
    situacao = fields.Boolean(required=True)