from api.app import db

class EmpresaModel(db.Model):
    __tablename__ = 'empresa'
    idEmpresa = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    nomeEmpresa = db.Column(db.String(50), nullable=False)
    dtRefSistema = db.Column(db.String(7), nullable=False)
    dtImplantacao = db.Column(db.String(50), nullable=False)
    endereco = db.Column(db.String(255), nullable=False)
    cidade = db.Column(db.String(50), nullable=False)
    cnpj = db.Column(db.String(50), nullable=False)
