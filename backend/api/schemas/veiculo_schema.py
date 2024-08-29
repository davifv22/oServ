from api.app import ma
from ..models import veiculo_model
from marshmallow import fields

class VeiculoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = veiculo_model.VeiculoModel
        load_instance = True
        fields = ('idVeiculo', 'modelo', 'marca', 'placa', 'kmRodados', 'idEquipe', 'situacao')

    modelo = fields.String(required=True)
    marca = fields.String(required=True)
    placa = fields.String(required=True)
    kmRodados = fields.String(required=True)
    idEquipe = fields.Integer(required=True)
    situacao = fields.Boolean(required=False)