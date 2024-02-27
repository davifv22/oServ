from api.app import db
from ..models import requerimento_model, veiculo_model

class OrdemServicoModel(db.Model):
    __tablename__ = 'ordem_servico'
    idOS = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    dtRefOS = db.Column(db.String(6), primary_key=True, nullable=False)
    idRequerimento = db.Column(db.Integer, db.ForeignKey('requerimento.idRequerimento', ondelete='CASCADE'), primary_key=True, nullable=False)
    dtRefRequerimento = db.Column(db.String(6), primary_key=True, nullable=False)
    descricao = db.Column(db.String(100), nullable=False)
    dtEmissao = db.Column(db.String(50), nullable=False)
    dtInicio = db.Column(db.String(50), nullable=False)
    dtTermino = db.Column(db.String(50), nullable=False)
    idVeiculo = db.Column(db.Integer, db.ForeignKey('veiculo.idVeiculo', ondelete='CASCADE'), nullable=False)
    situacao = db.Column(db.Integer, nullable=False, comment='0 - Emitida, 1 - Cancelada, 2 - Paga, 3 - Em execução, 4 - Finalizada')
    observacao = db.Column(db.String(255), nullable=False)


    Requerimento = db.relationship(requerimento_model.RequerimentoModel, backref=db.backref('ordemServico_requerimento', lazy='dynamic'))
    Veiculo = db.relationship(veiculo_model.VeiculoModel, backref=db.backref('ordemServico_veiculo', lazy='dynamic'))