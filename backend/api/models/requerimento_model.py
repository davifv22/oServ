from api.app import db
from ..models import cliente_model, tipo_requerimento_model

class RequerimentoModel(db.Model):
    __tablename__ = 'requerimento'
    idRequerimento = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    dtRefRequerimento = db.Column(db.String(6), primary_key=True, nullable=False)
    nomeRequerente = db.Column(db.String(50), nullable=False)
    endRequerente = db.Column(db.String(255), nullable=False)
    endServico = db.Column(db.String(255), nullable=False)
    docRequerente = db.Column(db.String(20), nullable=False)
    idCliente = db.Column(db.Integer, db.ForeignKey('cliente.idCliente', ondelete='CASCADE'), nullable=False)
    idTipoRequerimento = db.Column(db.Integer, db.ForeignKey('tipo_requerimento.idTipoRequerimento', ondelete='CASCADE'), nullable=False)
    observacao = db.Column(db.String(255), nullable=False)
    situacao = db.Column(db.Integer, nullable=False, comment='0 - Requerido, 1 - Cancelado, 2 - Ordem de serviço emitida, 3 - Ordem de serviço em execução, 4 - Ordem de serviço Concluída')
    dtRequerimento = db.Column(db.String(50), nullable=False)

    Cliente = db.relationship(cliente_model.ClienteModel, backref=db.backref('requerimento_cliente', lazy='dynamic'))
    TipoRequerimento = db.relationship(tipo_requerimento_model.TipoRequerimentoModel, backref=db.backref('requerimento_tipoRequerimento', lazy='dynamic'))