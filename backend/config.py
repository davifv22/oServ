import socket

SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'aplicacao_flask'
USERNAME = 'root'
DATABASE_PASSWORD = 'oServ'
PASSWORD = '12345'
#SERVER = f'{socket.gethostbyname(socket.gethostname())}'
SERVER = 'mysql'
PORT_MYSQL = '3306'
DB = 'db'

SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{USERNAME}:{DATABASE_PASSWORD}@{SERVER}:{PORT_MYSQL}/{DB}'
