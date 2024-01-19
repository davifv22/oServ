from flask_restful import Resource
from api.app import api
from flask import request, render_template, redirect, Blueprint, make_response
from flask_login import login_user, logout_user
from ..services import user_service


bp = Blueprint('login', __name__)

class Login(Resource):
    def post(self):
        user = request.form['user']
        senha = request.form['senha']
        user_bd = user_service.get_user(user)
        if user_bd and user_bd.ver_senha(senha):
            login_user(user_bd)
            return redirect('/')
        else:
            message_login = 'Usuário e/ou Senha incorretos!'
            response = make_response(render_template("home/home.html", message_login=message_login))
            response.mimetype = "text/html"
            return response


class Logout(Resource):
    def get(self):
        logout_user()
        return redirect('/home')


api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')