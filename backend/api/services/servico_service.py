from ..models import servico_model
from api.app import db


def get_servicos():
    servico_bd = servico_model.ServicoModel.query.all()
    servico_list = [{
        'idServico': servico.idServico,
        'descricao':servico.descricao,
        'tipo':servico.tipo, 
        'valor':servico.valor,
        'situacao':servico.situacao}
        for servico in servico_bd
    ]
    return servico_list