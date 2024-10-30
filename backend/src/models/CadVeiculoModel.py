from src.database import Base, sa

class CadVeiculo(Base):
    __tablename__ = "CadVeiculo"
    
    idVeiculo = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    modelo = sa.Column(sa.String(50), nullable=False)
    marca = sa.Column(sa.String(50), nullable=False)
    placa = sa.Column(sa.String(50), nullable=False)
    kmRodados = sa.Column(sa.String(50), nullable=False)
    idEquipe = sa.Column(sa.Integer, primary_key=True)
    situacao = sa.Column(sa.Boolean, default=True)
    dtCadastro = sa.Column(sa.Date, nullable=False)
