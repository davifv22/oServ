from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas.CadEquipeSchema import CadEquipeSchema, CadEquipeCreateSchema, CadEquipeListSchema
# from src.security import login_required
# from src.services.CadEquipeService import CadEquipeService
from src.models.CadEquipeModel import CadEquipe

router = APIRouter(prefix="/api") #, dependencies=[Depends(login_required)]

@router.post("/equipe/", response_model=CadEquipeSchema)
def create_equipe(equipe: CadEquipeCreateSchema, db: Session = Depends(get_db)):
    db_equipe = CadEquipe(**equipe.dict())
    db.add(db_equipe)
    db.commit()
    db.refresh(db_equipe)
    return db_equipe


@router.get("/equipe/{idEquipe}", response_model=CadEquipeListSchema)
def get_equipe(idEquipe: int, db: Session = Depends(get_db)):
    equipe = db.query(CadEquipe).filter(CadEquipe.idEquipe == idEquipe).first()
    if not equipe:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")
    return equipe

# @router.get("/", response_model=list[PostOut])
# async def read_posts(published: bool, limit: int, skip: int = 0):
#     return await service.read_all(published=published, limit=limit, skip=skip)