from ..models import funcionario_model
from api.app import db

def get_funcionarios():
    return funcionario_model.FuncionarioModel.query.filter_by(idFuncionario=1).first()