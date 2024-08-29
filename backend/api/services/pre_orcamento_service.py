from ..models import pre_orcamento_model
from api.app import db

def insert_preOrcamento(pre_orcamento):
    pre_orcamento_bd = pre_orcamento_model.PreOrcamentoModel(idTipoRequerimento=pre_orcamento.idTipoRequerimento, idServico=pre_orcamento.idServico, valor=pre_orcamento.valor)
    db.session.add(pre_orcamento_bd)
    db.session.commit()
    return pre_orcamento_bd

def update_preOrcamento(idTipoRequerimento, pre_orcamento):
    pass

def get_preOrcamentos():
    pre_orcamento_bd = pre_orcamento_model.PreOrcamentoModel.query.all()
    return pre_orcamento_bd

def get_preOrcamento_id(idTipoRequerimento):
    pre_orcamento_bd = pre_orcamento_model.PreOrcamentoModel.query.filter_by(idTipoRequerimento=idTipoRequerimento).first()
    return pre_orcamento_bd