from ..models import setor_model
from api.app import db

def insert_setor(setor):
    setor_bd = setor_model.SetorModel(descricao=setor.descricao, situacao=setor.situacao)
    db.session.add(setor_bd)
    db.session.commit()
    return setor_bd

def update_setor(idSetor, setor):
    setor_model.SetorModel.query.filter_by(idSetor=idSetor).update(
            {"descricao": setor['descricao'], "situacao": setor['situacao']})

    db.session.commit()
    
    setor_bd = get_setores()
    return setor_bd

def get_setores():
    return setor_model.SetorModel.query.all()