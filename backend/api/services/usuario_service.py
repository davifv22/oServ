from ..models import usuario_model
from api.app import db

def set_usuario(usuario):
    usuario_bd = usuario_model.UsuarioModel(user=usuario.user, nome=usuario.nome, email=usuario.email, senha=usuario.senha, situacao=usuario.situacao, isAdmin=usuario.isAdmin, apiKey=usuario.apiKey)
    usuario_bd.encriptar_senha()
    db.session.add(usuario_bd)
    db.session.commit()
    return usuario_bd

def update_usuario(idUser, usuario):
    usuario_model.UsuarioModel.query.filter_by(idUser=idUser).update(
            {"nome": usuario['nome'], "user": usuario['user'], "email": usuario['email']})

    # usuario_bd.encriptar_senha()
    db.session.commit()
    
    usuario_bd = get_usuario_id(idUser)
    return usuario_bd

def get_usuarios():
    usuarios_bd = usuario_model.UsuarioModel.query.all()
    usuarios_list = [{
        'idUser': user.idUser,
        'user':user.user,
        'nome':user.nome, 
        'email':user.email, 
        'senha':user.senha, 
        'situacao':user.situacao,
        'isAdmin':user.isAdmin, 
        'apiKey':user.apiKey}
        for user in usuarios_bd
    ]
    return usuarios_list

def get_usuario(usuario):
    return usuario_model.UsuarioModel.query.filter_by(user=usuario).first()

def get_usuario_id(idUser):
    return usuario_model.UsuarioModel.query.filter_by(idUser=idUser).first()

def get_usuario_apiKey(apiKey):
    return usuario_model.UsuarioModel.query.filter_by(apiKey=apiKey).first()