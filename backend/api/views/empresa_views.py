from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import empresa_schema
from ..services import empresa_service
from ..decorator import api_key_required

bp = Blueprint('empresa', __name__)
api = Api(bp)
class EmpresaDetail(Resource):
    @api_key_required
    def get(self):
        us = empresa_schema.EmpresaSchema()
        empresa = empresa_service.get_empresa()
        if empresa:
            return make_response(us.jsonify(empresa), 200)
        else:
            return make_response(jsonify({'message': 'Empresa não cadastrada!'}), 404)
        
api.add_resource(EmpresaDetail, '/empresa')