from api.app import db
from ..models import requerimento_model, cliente_model

class BoletoModel(db.Model):
    __tablename__ = 'boleto'
    idBoleto = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    idRequerimento = db.Column(db.Integer, db.ForeignKey('requerimento.idRequerimento', ondelete='CASCADE'), primary_key=True, nullable=False)
    dtRefRequerimento = db.Column(db.String(6), primary_key=True, nullable=False)
    valorTotal = db.Column(db.String(20), nullable=False)
    dtEmissao = db.Column(db.String(50), nullable=False)
    dtVencimento = db.Column(db.String(50), nullable=False)
    dtBaixa = db.Column(db.String(50), nullable=False)
    idCliente = db.Column(db.Integer, db.ForeignKey('cliente.idCliente', ondelete='CASCADE'), nullable=False)
    situacao = db.Column(db.Integer, default=0, nullable=False, comment='0 - Boleto emitido, 1 - Boleto cancelado, 2 - Processo de baixa, 3 - Boleto baixado')

    Requerimento = db.relationship(requerimento_model.RequerimentoModel, backref=db.backref('boleto_requerimento', lazy='dynamic'))
    Cliente = db.relationship(cliente_model.ClienteModel, backref=db.backref('boleto_cliente', lazy='dynamic'))