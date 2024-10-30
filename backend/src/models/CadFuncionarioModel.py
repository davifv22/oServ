from src.database import Base, sa

class CadFuncionario(Base):
    __tablename__ = "CadFuncionario"
    
    idFuncionario = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    idUsuario = sa.Column(sa.Integer, primary_key=True)
    nome = sa.Column(sa.String(100), nullable=False)
    idEquipe = sa.Column(sa.Integer, nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
    dtCadastro = sa.Column(sa.Date, nullable=False)
