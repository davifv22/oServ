import socket

SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'aplicacao_flask'
USERNAME = 'root'
PASSWORD = '12345'
#SERVER = f'{socket.gethostbyname(socket.gethostname())}'
SERVER = 'localhost'
PORT_MYSQL = '3306'
DB = 'db'
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{SERVER}:{PORT_MYSQL}/{DB}'
