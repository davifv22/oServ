from ..models import empresa_model
from api.app import db

def get_empresa():
    return empresa_model.EmpresaModel.query.filter_by(idEmpresa=1).first()