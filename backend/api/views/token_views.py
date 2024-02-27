from flask_restful import Resource
from api.app import api, jwt
from flask import request, make_response, jsonify
from ..schemas import token_schema
from ..services import usuario_service
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta, datetime


class TokenList(Resource):
    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        user_token = usuario_service.get_user_id(identity)
        if user_token.is_admin:
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
                    identity=usuario_bd.id,
                    expires_delta=timedelta(seconds=100))
                refresh_token = create_refresh_token(
                    identity=usuario_bd.id)

                return make_response(jsonify({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'dt_token': datetime.now(),
                    'message': 'Autenticação realizada com sucesso!'}), 200)

            return make_response(jsonify({
                'message': 'As credenciais estão inválidas!'}), 401)


api.add_resource(TokenList, '/token')