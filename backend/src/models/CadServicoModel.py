from src.database import Base, sa

class CadServico(Base):
    __tablename__ = "CadServico"
    
    idServico = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
    tipo = sa.Column(sa.Integer, nullable=False)
    valor = sa.Column(sa.String(20), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
