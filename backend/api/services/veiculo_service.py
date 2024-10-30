from ..models import veiculo_model
from api.app import db

def insert_veiculo(veiculo):
    veiculo_bd = veiculo_model.VeiculoModel(modelo=veiculo.modelo, marca=veiculo.marca, placa=veiculo.placa, kmRodados=veiculo.kmRodados, idEquipe=veiculo.idEquipe, situacao=veiculo.situacao)
    db.session.add(veiculo_bd)
    db.session.commit()
    return veiculo_bd

def update_veiculo(idVeiculo, veiculo):
    veiculo_model.VeiculoModel.query.filter_by(idVeiculo=idVeiculo).update(
            {"modelo": veiculo['modelo'], "marca": veiculo['marca'], "placa": veiculo['placa'], "kmRodados": veiculo['kmRodados'], "idEquipe": veiculo['idEquipe'], "situacao": veiculo['situacao']})

    db.session.commit()
    
    veiculo_bd = get_veiculo_id(idVeiculo)
    return veiculo_bd

def get_veiculos():
    veiculos_bd = veiculo_model.VeiculoModel.query.all()
    return veiculos_bd

def get_veiculo_id(idVeiculo):
    veiculo_bd = veiculo_model.VeiculoModel.query.filter_by(idVeiculo=idVeiculo).first()
    return veiculo_bd
