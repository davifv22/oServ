from api.app import db
from ..models import setor_model

class EquipeModel(db.Model):
    __tablename__ = 'equipe'
    idEquipe = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    descricao = db.Column(db.String(100), nullable=False)
    idSetor = db.Column(db.Integer, db.ForeignKey('setor.idSetor', ondelete='CASCADE'), nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)      

    Setor = db.relationship(setor_model.SetorModel, backref=db.backref('equipe_setor', lazy='dynamic'))