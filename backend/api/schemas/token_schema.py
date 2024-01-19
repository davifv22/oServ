from api.app import ma
from ..models import user_model
from marshmallow import fields

class LoginSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = user_model.User
        load_instance = True
        fields = ('id', 'user', 'nome', 'email', 'senha')

    user = fields.String(required=True)
    nome = fields.String(required=False)
    email = fields.String(required=False)
    senha = fields.String(required=True)
