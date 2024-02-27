from api.app import db
from ..models import equipe_model

class VeiculoModel(db.Model):
    __tablename__ = 'veiculo'
    idVeiculo = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    placa = db.Column(db.String(50), nullable=False)
    kmRodados = db.Column(db.String(50), nullable=False)
    idEquipe = db.Column(db.Integer, db.ForeignKey('equipe.idEquipe', ondelete='CASCADE'), primary_key=True, nullable=False)
    situacao = db.Column(db.Boolean, default=True, nullable=False)
    
    Equipe = db.relationship(equipe_model.EquipeModel, backref=db.backref('veiculo_equipe', lazy='dynamic'))