import socket

SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'aplicacao_flask'
USERNAME = 'oServ'
PASSWORD = '12345'
#SERVER = f'{socket.gethostbyname(socket.gethostname())}'
SERVER = '192.168.0.106'
PORT_MYSQL = '3306'
DB = 'db'
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{SERVER}:{PORT_MYSQL}/{DB}'
