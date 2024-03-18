from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import datetime

print(f'[{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} +0000] [SISTEMA] [INICIALIZANDO] 🟢  Sistema iniciando...')
app = Flask(__name__)
CORS(app)
app.config.from_object('config')

db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db)

from .views import token_views, refresh_token_views, login_views, usuarios_views, tipo_requerimento_views
from .models import boleto_model, boleto_servico_model, cliente_model, controle_model, equipe_model, funcionario_model, ordem_servico_model, pre_orcamento_model, requerimento_model, servico_model, setor_model, tipo_requerimento_model, usuario_model, veiculo_model

app.register_blueprint(tipo_requerimento_views.bp, url_prefix='/api')
app.register_blueprint(usuarios_views.bp, url_prefix='/api')
app.register_blueprint(login_views.bp, url_prefix='/api')
app.register_blueprint(token_views.bp, url_prefix='/api')
app.register_blueprint(refresh_token_views.bp, url_prefix='/api')

print(f'[{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} +0000] [SISTEMA] [INICIALIZANDO] 🟢  Sistema iniciado com sucesso!')