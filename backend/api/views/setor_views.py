from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import setor
from ..schemas import setor_schema
from ..services import setor_service
from ..models import setor_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('setor', __name__)
api = Api(bp)

class SetorList(Resource):
    @api_key_required
    def get(self):
        setores = setor_service.get_setores()
        print(setores)
        if setores:
            ss = setor_schema.SetorSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(setor_model.SetorModel, ss)
            else:
                return make_response(setores, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum setor encontrado!'}), 404)
        
    @api_key_required
    def post(self):
        ss = setor_schema.SetorSchema()
        v = ss.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            descricao = request.json['descricao']
            situacao = request.json['situacao']
            novo_setor = setor.Setor(descricao=descricao,
                                           situacao=situacao)
            x = setor_service.insert_setor(novo_setor)

            return make_response(ss.jsonify(x), 201)

class SetorDetail(Resource):
    @api_key_required
    def post(self, idSetor):
        ss = setor_schema.SetorSchema()
        v = ss.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = setor_service.update_setor(idSetor, request.json)
            return make_response(ss.jsonify(x), 201)
        
api.add_resource(SetorList, '/setor')
api.add_resource(SetorDetail, '/setor/<idSetor>')