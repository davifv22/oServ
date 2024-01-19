SERVER_URL= 'http://localhost:5000'
USERNAME = 'root'
PASSWORD = '12345'
SERVER = 'localhost'
DB = 'db'
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{SERVER}/{DB}'

SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'aplicacao_flask'