from ..models import cliente_model
from api.app import db


def get_clientes():
    clientes_bd = cliente_model.ClienteModel.query.all()
    clientes_list = [{
        'idCliente': cliente.idCliente,
        'nome':cliente.nome,
        'telefone':cliente.telefone, 
        'email':cliente.email,
        'doc':cliente.doc,
        'endereco':cliente.endereco,
        'bairro':cliente.bairro,
        'cidade':cliente.cidade,
        'cep':cliente.cep,
        'situacao':cliente.situacao,
        'observacao':cliente.observacao,
        'dtCadastro':cliente.dtCadastro}
        for cliente in clientes_bd
    ]
    return clientes_list