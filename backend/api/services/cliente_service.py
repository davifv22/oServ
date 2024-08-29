from ..models import cliente_model
from api.app import db

def insert_cliente(cliente):
    cliente_bd = cliente_model.ClienteModel(nome=cliente.nome, telefone=cliente.telefone, email=cliente.email, doc=cliente.doc, endereco=cliente.endereco, cidade=cliente.cidade, cep=cliente.cep, situacao=cliente.situacao, observacao=cliente.observacao, dtCadastro=cliente.dtCadastro)
    db.session.add(cliente_bd)
    db.session.commit()
    return cliente_bd
    
def update_cliente(idCliente, cliente):
    cliente_model.ClienteModel.query.filter_by(idCliente=idCliente).update(
            {"nome": cliente['nome'], "telefone": cliente['telefone'], "email": cliente['email'], "doc": cliente['doc'], "endereco": cliente['endereco'], "cidade": cliente['cidade'], "cep": cliente['cep'], "situacao": cliente['situacao'], "observacao": cliente['observacao']})

    db.session.commit()
    
    cliente_bd = get_cliente_id(idCliente)
    return cliente_bd

def get_clientes():
    clientes_bd = cliente_model.ClienteModel.query.all()
    return clientes_bd

def get_cliente_id(idCliente):
    cliente_bd = cliente_model.ClienteModel.query.filter_by(idCliente=idCliente).first()
    return cliente_bd