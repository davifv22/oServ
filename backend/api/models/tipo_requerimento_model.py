from api.app import db

class TipoRequerimentoModel(db.Model):
    __tablename__ = 'tipo_requerimento'
    idTipoRequerimento = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    descricao = db.Column(db.String(100), nullable=False)
    emiteOrcamento = db.Column(db.Boolean, nullable=False)
    emiteOS = db.Column(db.Boolean, nullable=False)
    situacao = db.Column(db.Boolean, nullable=False)
