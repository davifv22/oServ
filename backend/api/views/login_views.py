from flask_restful import Api, Resource
from flask import request, Blueprint, make_response, jsonify
from ..services import usuario_service
from ..schemas import usuario_schema
import datetime

bp = Blueprint('login', __name__)
api = Api(bp)

class Login(Resource):
    def post(self):
        us = usuario_schema.UsuarioSchema()
        usuario = request.json['usuario']
        senha = request.json['senha']
        usuario_bd = usuario_service.get_usuario(usuario)

        if usuario_bd and usuario_bd.ver_senha(senha):
            print(f'[{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} +0000] [LOGIN] [STATUS CODE: 201] ✔️  Usuário logado com sucesso: {usuario}')
            return make_response(us.jsonify(usuario_bd), 201)
        else:
            print(f'[{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} +0000] [LOGIN] [STATUS CODE: 401] ❌  As credenciais do usuário estão inválidas: {usuario}')
            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)

api.add_resource(Login, '/login')