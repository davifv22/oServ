from src.database import Base, sa

class CadUsuario(Base):
    __tablename__ = "CadUsuario"
    
    idUsuario = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    Usuario = sa.Column(sa.String(25), nullable=False)
    nome = sa.Column(sa.String(50), nullable=False)
    email = sa.Column(sa.String(100), nullable=False)
    senha = sa.Column(sa.String(255), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
    isFuncionario = sa.Column(sa.Boolean, default=False)
    isAdmin = sa.Column(sa.Boolean, default=False)
    apiKey = sa.Column(sa.String(100), nullable=True)
    dtCadastro = sa.Column(sa.Date, nullable=False)
