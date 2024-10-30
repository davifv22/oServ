from src.database import Base, sa

class CadOrdemServico(Base):
    __tablename__ = "CadOrdemServico"
    
    idTipoOS = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
