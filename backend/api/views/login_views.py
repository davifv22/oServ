from flask_restful import Resource
from api.app import api
from flask import request, Blueprint, make_response, jsonify
from ..services import usuario_service
from ..schemas import usuario_schema


bp = Blueprint('login', __name__)

class Login(Resource):
    def post(self):
        us = usuario_schema.UsuarioSchema()
        usuario = request.json['usuario']
        senha = request.json['senha']
        usuario_bd = usuario_service.get_usuario(usuario)

        if usuario_bd and usuario_bd.ver_senha(senha):
            return make_response(us.jsonify(usuario_bd), 201)
        else:
            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)

api.add_resource(Login, '/login')