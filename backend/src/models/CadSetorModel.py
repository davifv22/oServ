from src.database import Base, sa

class CadSetor(Base):
    __tablename__ = "CadSetor"
    
    idSetor = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
