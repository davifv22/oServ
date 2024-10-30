from src.database import Base, sa
from sqlalchemy.orm import relationship
from src.models.CadSetorModel import CadSetor

class CadEquipe(Base):
    __tablename__ = "CadEquipe"
    
    idEquipe = sa.Column(sa.Integer, primary_key=True, index=True, autoincrement=True)
    descricao = sa.Column(sa.String(100), nullable=False)
    idSetor = sa.Column(sa.Integer, sa.ForeignKey(CadSetor.idSetor), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
    
    # Relacionamento com o Setor
    setor = relationship(CadSetor)