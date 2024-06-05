from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import empresa_schema
from ..services import empresa_service
from ..entidades import empresa
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
        
    def post(self):
        es = empresa_schema.EmpresaSchema()
        v = es.validate(request.json['json'])
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = empresa_service.update_empresa(request.json['json'])
            return make_response(es.jsonify(x), 201)
        
api.add_resource(EmpresaDetail, '/empresa')