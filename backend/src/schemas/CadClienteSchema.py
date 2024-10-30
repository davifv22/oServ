from pydantic import BaseModel
from datetime import date
from typing import Optional

class CadClienteBase(BaseModel):
    nome: str
    telefone: str
    email: str
    doc: str
    endereco: str
    cidade: str
    cep: str
    situacao: bool = True
    observacao: Optional[str] = None

class CadClienteCreate(CadClienteBase):
    pass

class CadCliente(CadClienteBase):
    idCliente: int
    dtCadastro: date

    class Config:
        from_attributes = True
