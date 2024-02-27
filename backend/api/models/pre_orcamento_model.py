from api.app import db
from ..models import tipo_requerimento_model, servico_model

class PreOrcamentoModel(db.Model):
    __tablename__ = 'pre_orcamento'
    idTipoRequerimento = db.Column(db.Integer, db.ForeignKey('tipo_requerimento.idTipoRequerimento', ondelete='CASCADE'), primary_key=True, nullable=False)
    idServico = db.Column(db.Integer, db.ForeignKey('servico.idServico', ondelete='CASCADE'), primary_key=True, nullable=False)
    valor = db.Column(db.String(20), nullable=False)

    TipoRequerimento = db.relationship(tipo_requerimento_model.TipoRequerimentoModel, backref=db.backref('preOrcamento_tipoRequerimento', lazy='dynamic'))
    Servico = db.relationship(servico_model.ServicoModel, backref=db.backref('preOrcamento_servico', lazy='dynamic'))