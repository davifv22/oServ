from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import veiculo_schema
from ..services import veiculo_service
from ..models import veiculo_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('veiculo', __name__)
api = Api(bp)

class VeiculosList(Resource):
    @api_key_required
    def get(self):
        veiculos = veiculo_service.get_veiculos()
        if veiculos:
            cs = veiculo_schema.VeiculoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(veiculo_model.VeiculoModel, cs)
            else:
                return make_response(veiculos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum cliente encontrado!'}), 404)
        
api.add_resource(VeiculosList, '/veiculos')