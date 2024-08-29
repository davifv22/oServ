from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import tipo_requerimento
from ..schemas import tipo_requerimento_schema
from ..services import tipo_requerimento_service
from ..models import tipo_requerimento_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('tipo_requerimento', __name__)
api = Api(bp)

class TipoRequerimentosList(Resource):
    @api_key_required
    def get(self):
        tipo_requerimentos = tipo_requerimento_service.get_tipoRequerimentos()
        if tipo_requerimentos:
            cs = tipo_requerimento_schema.TipoRequerimentoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(tipo_requerimento_model.TipoRequerimentoModel, cs)
            else:
                return make_response(tipo_requerimentos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum tipo de requerimento encontrado!'}), 404)

    @api_key_required
    def post(self):
        trs = tipo_requerimento_schema.TipoRequerimentoSchema()
        v = trs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            descricao = request.json['descricao']
            emiteOrcamento = request.json['emiteOrcamento']
            emiteOS = request.json['emiteOS']
            situacao = request.json['situacao']
            novo_tipo_requerimento = tipo_requerimento.TipoRequerimento(descricao=descricao,
                                           emiteOrcamento=emiteOrcamento,
                                           emiteOS=emiteOS,
                                           situacao=situacao)
            x = tipo_requerimento_service.insert_tipoRequerimento(novo_tipo_requerimento)

            return make_response(trs.jsonify(x), 201)

class TipoRequerimentoDetail(Resource):
    @api_key_required
    def post(self, idTipoRequerimento):
        trs = tipo_requerimento_schema.TipoRequerimentoSchema()
        v = trs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = tipo_requerimento_service.update_tipoRequerimento(idTipoRequerimento, request.json)
            return make_response(trs.jsonify(x), 201)


api.add_resource(TipoRequerimentosList, '/tipo_requerimentos')
api.add_resource(TipoRequerimentoDetail, '/tipo_requerimento/<idTipoRequerimento>')