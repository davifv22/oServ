from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import pre_orcamento_schema
from ..services import pre_orcamento_service
from ..models import pre_orcamento_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('preOrcamento', __name__)
api = Api(bp)

class PreOrcamentosList(Resource):
    @api_key_required
    def get(self):
        preOrcamentos = pre_orcamento_service.get_preOrcamentos()
        if preOrcamentos:
            cs = pre_orcamento_schema.PreOrcamentoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(pre_orcamento_model.PreOrcamentoModel, cs)
            else:
                return make_response(preOrcamentos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum pré-orçamento encontrado!'}), 404)
        
api.add_resource(PreOrcamentosList, '/pre_orcamentos')