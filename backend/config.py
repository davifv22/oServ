DEBUG = True

SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'aplicacao_flask'
USERNAME = 'root'
PORT_MYSQL = '3306'
DB = 'db'

if DEBUG:
    PASSWORD = '12345'
    SERVER = 'localhost'
else:
    PASSWORD = 'oServ'
    SERVER = 'mysql'

SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{SERVER}:{PORT_MYSQL}/{DB}'
