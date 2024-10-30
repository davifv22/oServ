from pydantic import BaseModel
from typing import Optional
from .CadSetorSchema import CadSetorSchema

# Esquema para a Equipe (CadEquipe)
class CadEquipeSchema(BaseModel):
    idEquipe: int
    descricao: str
    idSetor: int
    situacao: bool
    setor: Optional[CadSetorSchema]  # Relacionamento com o Setor

    class Config:
        from_attributes = True


# Esquema para criação de nova equipe (sem id)
class CadEquipeCreateSchema(BaseModel):
    descricao: str
    idSetor: int
    situacao: Optional[bool] = True  # Valor padrão para 'situacao'

    class Config:
        from_attributes = True


# Esquema para listar equipes com o Setor associado
class CadEquipeListSchema(BaseModel):
    idEquipe: int
    descricao: str
    situacao: bool
    setor: Optional[CadSetorSchema]  # Relacionamento com o Setor

    class Config:
        from_attributes = True