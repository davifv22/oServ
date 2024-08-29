from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import equipe
from ..schemas import equipe_schema
from ..services import equipes_service
from ..models import equipe_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('equipe', __name__)
api = Api(bp)

class EquipesList(Resource):
    @api_key_required
    def get(self):
        equipes = equipes_service.get_equipes()
        if equipes:
            cs = equipe_schema.EquipeSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(equipe_model.EquipeModel, cs)
            else:
                return make_response(equipes, 200)
        else:
            return make_response(jsonify({'message': 'Nenhuma equipe encontrada!'}), 404)
        
    @api_key_required
    def post(self):
        vs = equipe_schema.EquipeSchema()
        v = vs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            descricao = request.json['descricao']
            idSetor = request.json['idSetor']
            situacao = request.json['situacao']
            nova_equipe = equipe.Equipe(descricao=descricao,
                                           idSetor=idSetor,
                                           situacao=situacao)
            x = equipes_service.insert_equipe(nova_equipe)

            return make_response(vs.jsonify(x), 201)

class EquipeDetail(Resource):
    @api_key_required
    def post(self, idEquipe):
        vs = equipe_schema.EquipeSchema()
        v = vs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = equipes_service.update_equipe(idEquipe, request.json)
            return make_response(vs.jsonify(x), 201)
        
api.add_resource(EquipesList, '/equipes')
api.add_resource(EquipeDetail, '/equipe/<idEquipe>')