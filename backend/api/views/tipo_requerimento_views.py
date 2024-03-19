from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..schemas import tipo_requerimento_schema
from ..services import tipo_requerimento_service
from ..models import tipo_requerimento_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('tipo_requerimento', __name__)
api = Api(bp)

class TipoRequerimentoList(Resource):
    @api_key_required
    def get(self):
        tipo_requerimento = tipo_requerimento_service.get_tipo_requerimento()
        if tipo_requerimento:
            cs = tipo_requerimento_schema.TipoRequerimentoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(tipo_requerimento_model.TipoRequerimentoModel, cs)
            else:
                return make_response(tipo_requerimento, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum tipo de requerimento encontrado!'}), 404)
        
api.add_resource(TipoRequerimentoList, '/tipo_requerimento')