from flask_restful import Resource
from api.app import api
from flask import request, render_template, redirect, Blueprint, make_response, jsonify
from flask_login import login_user, logout_user
from ..services import user_service


bp = Blueprint('login', __name__)

class Login(Resource):
    def post(self):
        usuario = request.json['usuario']
        senha = request.json['senha']
        user_bd = user_service.get_user(usuario)
        print(user_bd, usuario, senha, user_bd.ver_senha(senha))
        if user_bd and user_bd.ver_senha(senha):
            print('OK')
            login_user(user_bd)
            return make_response(jsonify({
                'message': 'Usuário logado!'}), 200)
        else:
            print('Not Found')
            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)


class Logout(Resource):
    def get(self):
        logout_user()
        return redirect('/home')


api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')