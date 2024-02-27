from api.app import db

class ClienteModel(db.Model):
    __tablename__ = 'cliente'
    idCliente = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    nome = db.Column(db.String(50), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    doc = db.Column(db.String(30), nullable=False)
    endereco = db.Column(db.String(100), nullable=False)
    bairro = db.Column(db.String(50), nullable=False)
    cidade = db.Column(db.String(50), nullable=False)
    cep = db.Column(db.String(9), nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)
    observacao = db.Column(db.String(255), nullable=False)
    dtCadastro = db.Column(db.String(50), nullable=False)
