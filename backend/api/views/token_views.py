from flask_restful import Api, Resource
from api.app import app
from flask import request, make_response, jsonify, Blueprint
from ..schemas import token_schema
from ..services import usuario_service
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token
from datetime import timedelta, datetime

bp = Blueprint('token', __name__)
api = Api(bp)
jwt = JWTManager(app)

class TokenList(Resource):
    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        user_token = usuario_service.get_usuario_id(identity)
        if user_token.isAdmin:
            roles = 'admin'
        else:
            roles = 'user'
        return {'roles': roles}

    def post(self):
        ls = token_schema.LoginSchema()
        v = ls.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            user = request.json['user']
            senha = request.json['senha']
            usuario_bd = usuario_service.get_usuario(user)
            if usuario_bd and usuario_bd.ver_senha(senha):
                access_token = create_access_token(
                    identity=usuario_bd.idUser,
                    expires_delta=timedelta(seconds=100))
                refresh_token = create_refresh_token(
                    identity=usuario_bd.idUser)

                return make_response(jsonify({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'dt_token': datetime.now(),
                    'message': 'Autenticação realizada com sucesso!'}), 200)

            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)


api.add_resource(TokenList, '/token')