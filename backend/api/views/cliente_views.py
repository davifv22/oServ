from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import cliente_schema
from ..services import cliente_service
from ..models import cliente_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('cliente', __name__)
api = Api(bp)

class ClientesList(Resource):
    @api_key_required
    def get(self):
        clientes = cliente_service.get_clientes()
        if clientes:
            cs = cliente_schema.ClienteSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(cliente_model.ClienteModel, cs)
            else:
                return make_response(clientes, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum cliente encontrado!'}), 404)
        
api.add_resource(ClientesList, '/clientes')