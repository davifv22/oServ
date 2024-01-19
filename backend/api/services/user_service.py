from ..models import user_model
from api.app import db

def set_user(user):
    user_bd = user_model.User(user=user.user, nome=user.nome, email=user.email, senha=user.senha, situacao=user.situacao, is_admin=user.is_admin, api_key=user.api_key)
    user_bd.encriptar_senha()
    db.session.add(user_bd)
    db.session.commit()
    return user_bd

def get_users():
    user_bd = user_model.User.query.all()
    return user_bd

def get_user(user):
    return user_model.User.query.filter_by(user=user).first()

def get_user_id(id):
    return user_model.User.query.filter_by(id=id).first()

def get_user_api_key(api_key):
    return user_model.User.query.filter_by(api_key=api_key).first()