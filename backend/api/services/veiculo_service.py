from ..models import veiculo_model
from api.app import db


def get_veiculos():
    veiculos_bd = veiculo_model.VeiculoModel.query.all()
    veiculos_list = [{
        'idVeiculo': veiculo.idVeiculo,
        'modelo':veiculo.modelo,
        'marca':veiculo.marca, 
        'placa':veiculo.placa,
        'kmRodados':veiculo.kmRodados,
        'idEquipe':veiculo.idEquipe,
        'situacao':veiculo.situacao}
        for veiculo in veiculos_bd
    ]
    return veiculos_list