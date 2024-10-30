from api.app import ma
from ..models import empresa_model
from marshmallow import fields
class EmpresaSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = empresa_model.EmpresaModel
        load_instance = True
        fields = ('idEmpresa', 'nomeEmpresa', 'dtRefSistema', 'dtImplantacao', 'endereco', 'cidade', 'cnpj')

    nomeEmpresa = fields.String(required=True)
    dtRefSistema = fields.String(required=True)
    dtImplantacao = fields.String(required=False)
    endereco = fields.String(required=True)
    cidade = fields.String(required=True)
    cnpj = fields.String(required=True)