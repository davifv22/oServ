from api.app import db

class SetorModel(db.Model):
    __tablename__ = 'setor'
    idSetor = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    descricao = db.Column(db.String(100), nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)