from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlalchemy as sa
import databases

SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:12345@localhost/banco"

database = databases.Database(SQLALCHEMY_DATABASE_URL)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# Se você precisar configurar o mapeamento manualmente, pode fazer aqui
from sqlalchemy.orm import registry
mapper_registry = registry()
mapper_registry.configure()