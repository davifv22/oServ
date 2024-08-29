from ..models import tipo_requerimento_model
from api.app import db

def insert_tipoRequerimento(tipo_requerimento):
    tipo_requerimento_bd = tipo_requerimento_model.TipoRequerimentoModel(descricao=tipo_requerimento.descricao, emiteOrcamento=tipo_requerimento.emiteOrcamento, emiteOS=tipo_requerimento.emiteOS, situacao=tipo_requerimento.situacao)
    db.session.add(tipo_requerimento_bd)
    db.session.commit()
    return tipo_requerimento_bd

def update_tipoRequerimento(idTipoRequerimento, tipo_requerimento):
    tipo_requerimento_model.TipoRequerimentoModel.query.filter_by(idTipoRequerimento=idTipoRequerimento).update(
            {"descricao": tipo_requerimento['descricao'], "emiteOrcamento": tipo_requerimento['emiteOrcamento'], "emiteOS": tipo_requerimento['emiteOS'], "situacao": tipo_requerimento['situacao']})

    db.session.commit()
    
    tipo_requerimento_bd = get_tipoRequerimento_id(idTipoRequerimento)
    return tipo_requerimento_bd

def get_tipoRequerimentos():
    tipo_requerimento_bd = tipo_requerimento_model.TipoRequerimentoModel.query.all()
    return tipo_requerimento_bd

def get_tipoRequerimento_id(idTipoRequerimento):
    tipo_requerimento_bd = tipo_requerimento_model.TipoRequerimentoModel.query.filter_by(idTipoRequerimento=idTipoRequerimento).first()
    return tipo_requerimento_bd