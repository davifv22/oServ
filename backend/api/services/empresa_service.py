from ..models import empresa_model
from api.app import db

def insert_empresa(empresa):
    empresa_bd = empresa_model.EmpresaModel(nomeEmpresa=empresa.nomeEmpresa, dtRefSistema=empresa.dtRefSistema, dtImplantacao=empresa.dtImplantacao, endereco=empresa.endereco, cnpj=empresa.cnpj, cidade=empresa.cidade)
    db.session.add(empresa_bd)
    db.session.commit()
    return empresa_bd

def update_empresa(empresa):
    empresa_model.EmpresaModel.query.filter_by(idEmpresa=1).update(
            {"nomeEmpresa": empresa['nomeEmpresa'], "dtRefSistema": empresa['dtRefSistema'], "endereco": empresa['endereco'], "cnpj": empresa['cnpj'], "cidade": empresa['cidade']})

    db.session.commit()
    
    empresa_bd = get_empresa()
    return empresa_bd

def get_empresa():
    return empresa_model.EmpresaModel.query.filter_by(idEmpresa=1).first()