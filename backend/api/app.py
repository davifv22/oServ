from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

db = SQLAlchemy()
ma = Marshmallow(app)
migrate = Migrate()

db.init_app(app)
migrate.init_app(app, db)

with app.app_context():
    from .views import token_views, refresh_token_views, login_views, usuarios_views, tipo_requerimento_views, empresa_views, cliente_views, servico_views, pre_orcamento_views, veiculo_views, funcionario_views
    from .models import boleto_model, boleto_servico_model, cliente_model, empresa_model, equipe_model, funcionario_model, ordem_servico_model, pre_orcamento_model, requerimento_model, servico_model, setor_model, tipo_requerimento_model, usuario_model, veiculo_model

app.register_blueprint(tipo_requerimento_views.bp, url_prefix='/api')
app.register_blueprint(servico_views.bp, url_prefix='/api')
app.register_blueprint(pre_orcamento_views.bp, url_prefix='/api')
app.register_blueprint(veiculo_views.bp, url_prefix='/api')
app.register_blueprint(cliente_views.bp, url_prefix='/api')
app.register_blueprint(empresa_views.bp, url_prefix='/api')
app.register_blueprint(funcionario_views.bp, url_prefix='/api')
app.register_blueprint(usuarios_views.bp, url_prefix='/api')
app.register_blueprint(login_views.bp, url_prefix='/api')
app.register_blueprint(token_views.bp, url_prefix='/api')
app.register_blueprint(refresh_token_views.bp, url_prefix='/api')
