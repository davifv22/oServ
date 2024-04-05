from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import funcionario_schema
from ..services import funcionario_service
from ..models import funcionario_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('funcionarios', __name__)
api = Api(bp)

class FuncionariosList(Resource):
    # @api_key_required
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
        
api.add_resource(FuncionariosList, '/funcionarios')