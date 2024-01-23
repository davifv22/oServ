from flask_restful import Resource
from api.app import api
from flask import request, redirect, Blueprint, make_response, jsonify
from flask_login import login_user, logout_user, user_accessed
from ..services import user_service
from ..schemas import user_schema


bp = Blueprint('login', __name__)

class Login(Resource):
    def post(self):
        us = user_schema.UserSchema()
        usuario = request.json['usuario']
        senha = request.json['senha']
        user_bd = user_service.get_user(usuario)

        if user_bd and user_bd.ver_senha(senha):
            return make_response(us.jsonify(user_bd), 200)
        else:
            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)

class Logout(Resource):
    def get(self):
        logout_user()
        return redirect('/login')


api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')