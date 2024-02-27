from api.app import db
from ..models import boleto_model, servico_model

class BoletoServicoModel(db.Model):
    __tablename__ = 'boleto_servico'
    idBoleto = db.Column(db.Integer, db.ForeignKey('boleto.idBoleto', ondelete='CASCADE'), primary_key=True, nullable=False)
    idServico = db.Column(db.Integer, db.ForeignKey('servico.idServico', ondelete='CASCADE'), primary_key=True, nullable=False)
    valor = db.Column(db.String(20), nullable=False)
    dtVencimento = db.Column(db.String(50), nullable=False)
    complemento = db.Column(db.String(255), nullable=False)
    situacao = db.Column(db.Integer, nullable=False, comment='0 - Faturado, 1 - Incluido, 3 - Estornado')

    Boleto = db.relationship(boleto_model.BoletoModel, backref=db.backref('boletoServico_boleto', lazy='dynamic'))
    Servico = db.relationship(servico_model.ServicoModel, backref=db.backref('boletoServico_servico', lazy='dynamic'))