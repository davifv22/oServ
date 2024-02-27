from flask_restful import Resource
from api.app import api
from flask import request, make_response, jsonify, Blueprint
from ..schemas import usuario_schema
from ..entidades import usuario
from ..services import usuario_service
from ..models import usuario_model
from ..decorator import api_key_required
from ..paginate import paginate
import uuid

bp = Blueprint('usuarios', __name__)

class UsuariosList(Resource):
    @api_key_required
    def get(self):
        usuarios = usuario_service.get_usuarios()
        if usuarios:
            cs = usuario_schema.UsuarioSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(usuario_model.UsuarioModel, cs)
            else:
                return make_response(usuarios, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum usuário encontrado!'}), 404)

    # @api_key_required
    def post(self):
        us = usuario_schema.UsuarioSchema()
        v = us.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            user = request.json['user']
            nome = request.json['nome']
            email = request.json['email']
            senha = request.json['senha']
            situacao = True
            isAdmin = request.json['isAdmin']
            apiKey = str(uuid.uuid4())
            novo_usuario = usuario.Usuario(user=user, nome=nome, email=email, senha=senha, situacao=situacao, isAdmin=isAdmin, apiKey=apiKey)
            x = usuario_service.set_usuario(novo_usuario)
            
            return make_response(us.jsonify(x), 201)

class UsuarioDetail(Resource):
    @api_key_required
    def get(self, idUser):
        us = usuario_schema.UsuarioSchema()
        usuario = usuario_service.get_usuario_id(idUser)
        if usuario:
            return make_response(us.jsonify(usuario), 200)
        else:
            return make_response(jsonify({'message': 'Usuário não encontrado!'}), 404)


api.add_resource(UsuariosList, '/usuarios')
api.add_resource(UsuarioDetail, '/usuario/<idUser>')

# 	"nome": "ADMINISTRADOR",
# 	"user": "admin",
# 	"email": "admin@mail.com",
# 	"senha": "admin",
# 	"isAdmin": 1
