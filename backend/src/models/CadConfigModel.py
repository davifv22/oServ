from src.database import Base, sa

class CadConfig(Base):
    __tablename__ = "CadConfig"
    
    idConfig = sa.Column(sa.Integer, primary_key=True, index=True, autoincrement=True)
    dtRefSistema = sa.Column(sa.String(6), nullable=False)
