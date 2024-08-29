from ..models import servico_model
from api.app import db

def insert_servico(servico):
    servico_bd = servico_model.ServicoModel(descricao=servico.descricao, tipo=servico.tipo, valor=servico.valor, situacao=servico.situacao)
    db.session.add(servico_bd)
    db.session.commit()
    return servico_bd

def update_servico(idServico, servico):
    servico_model.ServicoModel.query.filter_by(idServico=idServico).update(
            {"descricao": servico['descricao'], "tipo": servico['tipo'], "valor": servico['valor'], "situacao": servico['situacao']})

    db.session.commit()
    
    servico_bd = get_servico_id(idServico)
    return servico_bd

def get_servicos():
    servicos_bd = servico_model.ServicoModel.query.all()
    return servicos_bd

def get_servico_id(idServico):
    servico_bd = servico_model.ServicoModel.query.filter_by(idServico=idServico).first()
    return servico_bd