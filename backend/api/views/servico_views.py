from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import servico_schema
from ..services import servico_service
from ..models import servico_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('servico', __name__)
api = Api(bp)

class ServicosList(Resource):
    @api_key_required
    def get(self):
        servicos = servico_service.get_servicos()
        if servicos:
            cs = servico_schema.ServicoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(servico_model.ServicoModel, cs)
            else:
                return make_response(servicos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum servico encontrado!'}), 404)
        
api.add_resource(ServicosList, '/servicos')