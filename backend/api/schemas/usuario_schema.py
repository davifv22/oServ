from api.app import ma
from ..models import usuario_model
from marshmallow import fields

class UsuarioSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = usuario_model.UsuarioModel
        load_instance = True
        fields = ('idUser', 'user', 'nome', 'email', 'senha', 'situacao', 'isAdmin', 'apiKey')

    nome = fields.String(required=True)
    user = fields.String(required=True)
    email = fields.String(required=True)
    senha = fields.String(required=False)
    situacao = fields.Boolean(required=False)
    isAdmin = fields.Boolean(required=False)
    apiKey = fields.String(required=False)