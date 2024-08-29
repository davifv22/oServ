from ..models import funcionario_model
from api.app import db

def insert_funcionario(funcionario):
    funcionario_bd = funcionario_model.FuncionarioModel(idUser=funcionario.idUser, nome=funcionario.nome, idEquipe=funcionario.idEquipe, situacao=funcionario.situacao)
    db.session.add(funcionario_bd)
    db.session.commit()
    return funcionario_bd

def update_funcionario(idFuncionario, funcionario):
    funcionario_model.funcionarioModel.query.filter_by(idFuncionario=idFuncionario).update(
            {"nome": funcionario['nome'], "idEquipe": funcionario['idEquipe'], "situacao": funcionario['situacao']})

    db.session.commit()
    
    funcionario_bd = get_funcionario_id(idFuncionario)
    return funcionario_bd

def get_funcionarios():
    funcionarios_bd = funcionario_model.FuncionarioModel.query.all()
    return funcionarios_bd

def get_funcionario_id(idFuncionario):
    funcionario_bd = funcionario_model.FuncionarioModel.query.filter_by(idFuncionario=idFuncionario).first()
    return funcionario_bd