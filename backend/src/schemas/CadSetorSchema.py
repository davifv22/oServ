from pydantic import BaseModel

# Esquema para o Setor (CadSetor)
class CadSetorSchema(BaseModel):
    idSetor: int
    descricao: str
    situacao: bool

    class Config:
        from_attributes = True