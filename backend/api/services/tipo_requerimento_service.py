from ..models import tipo_requerimento_model
from api.app import db


def get_tipo_requerimento():
    tipo_requerimento_bd = tipo_requerimento_model.TipoRequerimentoModel.query.all()
    tipo_requerimento_list = [{
        'idTipoRequerimento': tipo.idTipoRequerimento,
        'descricao':tipo.descricao,
        'emiteOrcamento':tipo.emiteOrcamento, 
        'emiteOS':tipo.emiteOS,
        'situacao':tipo.situacao}
        for tipo in tipo_requerimento_bd
    ]
    return tipo_requerimento_list