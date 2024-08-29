from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import funcionario
from ..schemas import funcionario_schema
from ..services import funcionario_service
from ..models import funcionario_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('funcionarios', __name__)
api = Api(bp)

class FuncionariosList(Resource):
    @api_key_required
    def get(self):
        funcionarios = funcionario_service.get_funcionarios()
        if funcionarios:
            fs = funcionario_schema.FuncionarioSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(funcionario_model.FuncionarioModel, fs)
            else:
                return make_response(funcionarios, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum funcionario encontrado!'}), 404)


    @api_key_required
    def post(self):
        fs = funcionario_schema.FuncionarioSchema()
        v = fs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            idUser = request.json['idUser']
            nome = request.json['nome']
            idEquipe = request.json['idEquipe']
            situacao = request.json['situacao']
            novo_funcionario = funcionario.Funcionario(idUser=idUser,
                                           nome=nome,
                                           idEquipe=idEquipe,
                                           situacao=situacao)
            x = funcionario_service.insert_funcionario(novo_funcionario)

            return make_response(fs.jsonify(x), 201)

class FuncionarioDetail(Resource):
    @api_key_required
    def post(self, idFuncionario):
        fs = funcionario_schema.FuncionarioSchema()
        v = fs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = funcionario_service.update_funcionario(idFuncionario, request.json)
            return make_response(fs.jsonify(x), 201)
        
api.add_resource(FuncionariosList, '/funcionarios')
api.add_resource(FuncionarioDetail, '/funcionario/<idFuncionario>')