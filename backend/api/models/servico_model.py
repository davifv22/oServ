from api.app import db

class ServicoModel(db.Model):
    __tablename__ = 'servico'
    idServico = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    descricao = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.Integer, nullable=False)
    valor = db.Column(db.String(20), nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)
