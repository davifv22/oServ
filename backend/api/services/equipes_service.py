from ..models import equipe_model
from api.app import db

def insert_equipe(equipe):
    equipe_bd = equipe_model.EquipeModel(descricao=equipe.descricao, idSetor=equipe.idSetor, situacao=equipe.situacao)
    db.session.add(equipe_bd)
    db.session.commit()
    return equipe_bd

def update_equipe(idEquipe, equipe):
    equipe_model.EquipeModel.query.filter_by(idEquipe=idEquipe).update(
            {"descricao": equipe['descricao'], "idSetor": equipe['idSetor'], "situacao": equipe['situacao']})

    db.session.commit()
    
    equipe_bd = get_equipes()
    return equipe_bd

def get_equipes():
    return equipe_model.EquipeModel.query.all()