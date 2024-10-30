from src.database import Base, sa

class CadTipoServico(Base):
    __tablename__ = "CadTipoServico"
    
    idTipoServico = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
