from flask_restful import Resource
from api.app import api
from flask import request, make_response, jsonify, render_template, Blueprint
from flask_login import login_required
from ..schemas import user_schema
from ..entidades import user
from ..services import user_service
import uuid

bp = Blueprint('usuarios', __name__)

class UserList(Resource):
    # @login_required
    def get(self):
        usuarios = user_service.get_users()
        response = make_response(render_template("cPanel/usuarios.html", usuarios=usuarios))
        response.mimetype = "text/html"
        return response
    
    # @login_required
    def post(self):
        us = user_schema.UserSchema()
        v = us.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            user_ = request.json['user']
            nome = request.json['nome']
            email = request.json['email']
            senha = request.json['senha']
            situacao = True
            is_admin = request.json['is_admin']
            api_key = str(uuid.uuid4())
            novo_user = user.User(user=user_, nome=nome, email=email, senha=senha, situacao=situacao, is_admin=is_admin, api_key=api_key)
            x = user_service.set_user(novo_user)
            
            return make_response(us.jsonify(x), 201)

class UserDetail(Resource):
    # @login_required
    def get(self, user):
        usuario = user_service.get_user(user)
        response = make_response(render_template("cPanel/meu_perfil.html", usuario=usuario))
        response.mimetype = "text/html"
        return response


api.add_resource(UserList, '/usuarios')
api.add_resource(UserDetail, '/perfil/<user>')


# {
# 	"nome": "ADMINISTRADOR",
# 	"user": "admin",
# 	"email": "admin@mail.com",
# 	"senha": "admin123",
# 	"is_admin": 1
# }