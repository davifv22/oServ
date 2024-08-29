import datetime
from flask_restful import Api, Resource
from flask import request, make_response, jsonify, Blueprint
from ..entidades import cliente
from ..schemas import cliente_schema
from ..services import cliente_service
from ..models import cliente_model
from ..decorator import api_key_required
from ..paginate import paginate

bp = Blueprint('cliente', __name__)
api = Api(bp)

class ClientesList(Resource):
    @api_key_required
    def get(self):
        clientes = cliente_service.get_clientes()
        if clientes:
            cs = cliente_schema.ClienteSchema(many=True)
            if request.args.get('isPaginate') == 'true':
                return paginate(cliente_model.ClienteModel, cs)
            else:
                return make_response(clientes, 200)
        else:
            return make_response(jsonify({'message': 'Nenhum cliente encontrado!'}), 404)


    @api_key_required
    def post(self):
        cs = cliente_schema.ClienteSchema()
        v = cs.validate(request.json)
        print(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            nome = request.json['nome']
            telefone = request.json['telefone']
            email = request.json['email']
            doc = request.json['doc']
            endereco = request.json['endereco']
            cidade = request.json['cidade']
            cep = request.json['cep']
            situacao = request.json['situacao']
            observacao = request.json['observacao']
            dtCadastro = datetime.datetime.now().strftime("%d/%m/%Y")
            novo_cliente = cliente.Cliente(nome=nome,
                                           telefone=telefone,
                                           email=email,
                                           doc=doc,
                                           endereco=endereco,
                                           cidade=cidade,
                                           cep=cep,
                                           situacao=situacao,
                                           observacao=observacao,
                                           dtCadastro=dtCadastro)
            x = cliente_service.insert_cliente(novo_cliente)

            return make_response(cs.jsonify(x), 201)

class ClienteDetail(Resource):
    @api_key_required
    def post(self, idCliente):
        cs = cliente_schema.ClienteSchema()
        v = cs.validate(request.json)
        if v:
            return make_response(jsonify(v), 400)
        else:
            x = cliente_service.update_cliente(idCliente, request.json)
            return make_response(cs.jsonify(x), 201)
        
api.add_resource(ClientesList, '/clientes')
api.add_resource(ClienteDetail, '/cliente/<idCliente>')