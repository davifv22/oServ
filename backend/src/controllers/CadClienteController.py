# from fastapi import APIRouter, Depends, status

# from src.schemas.CadClienteSchema import PostIn, PostUpdateIn
# from src.security import login_required
# from src.services.post import PostService
# from src.views.post import PostOut

# router = APIRouter(prefix="/posts", dependencies=[Depends(login_required)])

# service = PostService()


# @router.get("/", response_model=list[PostOut])
# async def read_posts(published: bool, limit: int, skip: int = 0):
#     return await service.read_all(published=published, limit=limit, skip=skip)


# @router.post("/", status_code=status.HTTP_201_CREATED, response_model=PostOut)
# async def create_post(post: PostIn):
#     return {**post.model_dump(), "id": await service.create(post)}


# @router.get("/{id}", response_model=PostOut)
# async def read_post(id: int):
#     return await service.read(id)


# @router.patch("/{id}", response_model=PostOut)
# async def update_post(id: int, post: PostUpdateIn):
#     return await service.update(id=id, post=post)


# @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
# async def delete_post(id: int):
#     await service.delete(id)


# @app.post("/clientes/", response_model=schemas.CadCliente)
# def create_cliente(cliente: schemas.CadClienteCreate, db: Session = Depends(get_db)):
#     db_cliente = models.CadCliente(**cliente.dict())
#     db.add(db_cliente)
#     db.commit()
#     db.refresh(db_cliente)
#     return db_cliente

# @app.get("/clientes/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
# def read_cliente(cliente_id: int, db: Session = Depends(get_db)):
#     db_cliente = db.query(models.CadCliente).filter(models.CadCliente.idCliente == cliente_id).first()
#     if db_cliente is None:
#         raise HTTPException(status_code=404, detail="Cliente not found")
#     return db_cliente
