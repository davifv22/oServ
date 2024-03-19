from ..models import pre_orcamento_model
from api.app import db


def get_preOrcamentos():
    preOrcamento_bd = pre_orcamento_model.PreOrcamentoModel.query.all()
    preOrcamento_list = [{
        'idTipoRequerimento': preOrcamento.idTipoRequerimento,
        'idServico':preOrcamento.idServico,
        'valor':preOrcamento.valor}
        for preOrcamento in preOrcamento_bd
    ]
    return preOrcamento_list