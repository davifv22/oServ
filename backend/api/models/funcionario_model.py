from api.app import db
from ..models import usuario_model, equipe_model

class FuncionarioModel(db.Model):
    __tablename__ = 'funcionario'
    idFuncionario = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    idUser = db.Column(db.Integer, db.ForeignKey('usuario.idUser', ondelete='CASCADE'), primary_key=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    idEquipe = db.Column(db.Integer, db.ForeignKey('equipe.idEquipe', ondelete='CASCADE'), nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)
    
    
    Usuario = db.relationship(usuario_model.UsuarioModel, backref=db.backref('boleto_usuario', lazy='dynamic'))
    Equipe = db.relationship(equipe_model.EquipeModel, backref=db.backref('funcionario_equipe', lazy='dynamic'))