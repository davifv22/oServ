from src.database import Base, sa

class CadEmpresa(Base):
    __tablename__ = "CadEmpresa"
    
    idEmpresa = sa.Column(sa.Integer, primary_key=True, index=True, autoincrement=True)
    nomeEmpresa = sa.Column(sa.String(50), nullable=False)
    dtImplantacao = sa.Column(sa.Date, nullable=False)
    endereco = sa.Column(sa.String(255), nullable=False)
    cidade = sa.Column(sa.String(50), nullable=False)
    cnpj = sa.Column(sa.String(50), nullable=False)
