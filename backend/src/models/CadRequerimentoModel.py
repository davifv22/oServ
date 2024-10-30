from src.database import Base, sa

class CadRequerimento(Base):
    __tablename__ = "CadRequerimento"
    
    idTipoRequerimento = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
    emiteOrcamento = sa.Column(sa.Boolean, default=False)
    emiteOS = sa.Column(sa.Boolean, default=False)
    situacao = sa.Column(sa.Boolean, default=True)
