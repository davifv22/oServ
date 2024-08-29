from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import pre_orcamento
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
            po = pre_orcamento_schema.PreOrcamentoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(pre_orcamento_model.PreOrcamentoModel, po)
            else:
                return make_response(preOrcamentos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum pré-orçamento encontrado!'}), 404)

    @api_key_required
    def post(self):
        po = pre_orcamento_schema.PreOrcamentoSchema()
        v = po.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            idServico = request.json['idServico']
            valor = request.json['valor']
            novo_preOrcamento = pre_orcamento.PreOrcamento(idServico=idServico,
                                           valor=valor)
            x = pre_orcamento_service.insert_preOrcamento(novo_preOrcamento)

            return make_response(po.jsonify(x), 201)

class PreOrcamentoDetail(Resource):
    @api_key_required
    def post(self, idPreOrcamento):
        po = pre_orcamento_schema.PreOrcamentoSchema()
        v = po.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = pre_orcamento_service.update_preOrcamento(idPreOrcamento, request.json)
            return make_response(po.jsonify(x), 201)
        
api.add_resource(PreOrcamentosList, '/pre_orcamentos')
api.add_resource(PreOrcamentoDetail, '/pre_orcamento/<idPreOrcamento>')