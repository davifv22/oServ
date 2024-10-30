from datetime import date

from src.database import Base, sa

class CadCliente(Base):
    __tablename__ = "CadCliente"

    idCliente = sa.Column(sa.Integer, primary_key=True, index=True, autoincrement=True)
    nome = sa.Column(sa.String(50), nullable=False)
    telefone = sa.Column(sa.String(20), nullable=False)
    email = sa.Column(sa.String(50), nullable=False)
    doc = sa.Column(sa.String(30), nullable=False)
    endereco = sa.Column(sa.String(100), nullable=False)
    cidade = sa.Column(sa.String(50), nullable=False)
    cep = sa.Column(sa.String(9), nullable=False)
    situacao = sa.Column(sa.Boolean, default=True)
    observacao = sa.Column(sa.String(255), nullable=True)
    dtCadastro = sa.Column(sa.Date, default=date.today)
