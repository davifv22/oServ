from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import servico
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
    
    @api_key_required
    def post(self):
        vs = servico_schema.ServicoSchema()
        v = vs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            descricao = request.json['descricao']
            tipo = request.json['tipo']
            valor = request.json['valor']
            situacao = request.json['situacao']
            novo_servico = servico.Servico(descricao=descricao,
                                           tipo=tipo,
                                           valor=valor,
                                           situacao=situacao)
            x = servico_service.insert_servico(novo_servico)

            return make_response(vs.jsonify(x), 201)

class ServicoDetail(Resource):
    @api_key_required
    def post(self, idServico):
        ss = servico_schema.ServicoSchema()
        v = ss.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = servico_service.update_servico(idServico, request.json)
            return make_response(ss.jsonify(x), 201)

api.add_resource(ServicosList, '/servicos')
api.add_resource(ServicoDetail, '/servico/<idServico>')