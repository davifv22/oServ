import datetime
from flask_restful import Api, Resource
from flask import request, Blueprint, make_response, jsonify

from ..entidades import usuario, empresa
from ..services import usuario_service, empresa_service
from ..schemas import usuario_schema
import uuid

bp = Blueprint('login', __name__)
api = Api(bp)

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
            
class LoginDB(Resource):
    def get(self):
        try:
            usuario_adm = usuario_service.get_usuario_id(1)
            if usuario_adm:
                return True
            else:
                return False
        except:
            return False
    
    def post(self):
        senha = request.json['json']['senha']
        if senha == '1234':
            from api.app import db
            db.create_all()
            
            nome = 'ADMINISTRADOR'
            user = 'admin'
            email = 'admin@mail.com'
            senha = 'admin'
            situacao = True
            isAdmin = True
            apiKey = str(uuid.uuid4())
            novo_usuario = usuario.Usuario(user=user, nome=nome, email=email, senha=senha, situacao=situacao, isAdmin=isAdmin, apiKey=apiKey)
            x = usuario_service.set_usuario(novo_usuario)
            
            nomeEmpresa = ''
            dtRefSistema = ''
            dtImplantacao = datetime.datetime.now()
            endereco = ''
            cnpj = ''
            cidade = ''
            nova_empresa = empresa.Empresa(nomeEmpresa=nomeEmpresa, dtRefSistema=dtRefSistema, dtImplantacao=dtImplantacao, endereco=endereco, cnpj=cnpj, cidade=cidade)
            x = empresa_service.set_empresa(nova_empresa)

            return True
        else:
            return False

api.add_resource(Login, '/login')
api.add_resource(LoginDB, '/usuario/db')