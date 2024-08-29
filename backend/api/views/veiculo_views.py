from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import veiculo
from ..schemas import veiculo_schema
from ..services import veiculo_service
from ..models import veiculo_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('veiculo', __name__)
api = Api(bp)

class VeiculosList(Resource):
    @api_key_required
    def get(self):
        veiculos = veiculo_service.get_veiculos()
        if veiculos:
            cs = veiculo_schema.VeiculoSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(veiculo_model.VeiculoModel, cs)
            else:
                return make_response(veiculos, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum cliente encontrado!'}), 404)
        
    @api_key_required
    def post(self):
        vs = veiculo_schema.VeiculoSchema()
        v = vs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            modelo = request.json['modelo']
            marca = request.json['marca']
            placa = request.json['placa']
            kmRodados = request.json['kmRodados']
            idEquipe = request.json['idEquipe']
            novo_veiculo = veiculo.Veiculo(modelo=modelo,
                                           marca=marca,
                                           placa=placa,
                                           kmRodados=kmRodados,
                                           idEquipe=idEquipe,
                                           situacao=True)
            x = veiculo_service.insert_veiculo(novo_veiculo)

            return make_response(vs.jsonify(x), 201)

class VeiculoDetail(Resource):
    @api_key_required
    def post(self, idVeiculo):
        vs = veiculo_schema.VeiculoSchema()
        v = vs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = veiculo_service.update_veiculo(idVeiculo, request.json)
            return make_response(vs.jsonify(x), 201)

        
api.add_resource(VeiculosList, '/veiculos')
api.add_resource(VeiculoDetail, '/veiculo/<idVeiculo>')