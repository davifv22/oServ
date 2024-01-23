from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)

from .views import user_views, token_views, refresh_token_views, header_views, login_views
from .models import user_model

app.register_blueprint(user_views.bp)
app.register_blueprint(header_views.bp)
app.register_blueprint(login_views.bp)

