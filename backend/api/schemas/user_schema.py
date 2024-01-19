from api.app import ma
from ..models import user_model
from marshmallow import fields

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = user_model.User
        load_instance = True
        fields = ('id', 'user', 'nome', 'email', 'senha', 'situacao', 'is_admin', 'api_key')

    nome = fields.String(required=True)
    user = fields.String(required=True)
    email = fields.String(required=True)
    senha = fields.String(required=True)
    situacao = fields.String(required=False)
    is_admin = fields.Boolean(required=True)
    api_key = fields.String(required=False)