from api.app import ma
from ..models import cliente_model
from marshmallow import fields

class ClienteSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = cliente_model.ClienteModel
        load_instance = True
        fields = ('idCliente', 'nome', 'telefone', 'email', 'doc', 'endereco', 'cidade', 'cep', 'situacao', 'observacao', 'dtCadastro')

    nome = fields.String(required=True)
    telefone = fields.String(required=True)
    email = fields.String(required=True)
    doc = fields.String(required=True)
    endereco = fields.String(required=True)
    cidade = fields.String(required=True)
    cep = fields.String(required=True)
    situacao = fields.Boolean(required=False)
    observacao = fields.String(required=True)
    dtCadastro = fields.String(required=True)
