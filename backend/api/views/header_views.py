from flask_restful import Resource
from flask import request, render_template, redirect, Blueprint, make_response, jsonify
from api.app import api

bp = Blueprint('header', __name__)

class Header(Resource):
    def get(self):
        return make_response(
            jsonify({
            'nome': 'oServ - Gestão de Ordem de Serviço',
            'mensagem': 'API desenvolvida em Flask, para gestão de Ordem de Serviço!',
            'status': 'Em construção...'
            }), 200
        )


api.add_resource(Header, '/')