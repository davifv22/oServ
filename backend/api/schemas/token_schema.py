from api.app import ma
from ..models import usuario_model
from marshmallow import fields

class LoginSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = usuario_model.UsuarioModel
        load_instance = True
        fields = ('id', 'user', 'nome', 'email', 'senha')

    user = fields.String(required=True)
    nome = fields.String(required=False)
    email = fields.String(required=False)
    senha = fields.String(required=True)
