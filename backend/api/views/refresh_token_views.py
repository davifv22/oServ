from flask_restful import Api, Resource
from flask import make_response, Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime

bp = Blueprint('refresh_token', __name__)
api = Api(bp)
class RefreshTokenList(Resource):
    @jwt_required(refresh=True)
    def post(self):
        user_token = get_jwt_identity()
        access_token = create_access_token(
            identity=user_token,
            expires_delta=timedelta(seconds=100))
        refresh_token = create_refresh_token(
            identity=user_token)
        return make_response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'dt_refresh_token': datetime.now()}, 200)


api.add_resource(RefreshTokenList, '/token/refresh')