class Usuario():
    def __init__(self, user, nome, email, senha, situacao, isAdmin, apiKey):
        self.__user = user
        self.__nome = nome
        self.__email = email
        self.__senha = senha
        self.__situacao = situacao
        self.__isAdmin = isAdmin
        self.__apiKey = apiKey

    @property
    def user(self):
        return self.__user

    @user.setter
    def user(self, user):
        self.__user = user

    @property
    def nome(self):
        return self.__nome

    @nome.setter
    def nome(self, nome):
        self.__nome = nome

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, email):
        self.__email = email

    @property
    def senha(self):
        return self.__senha

    @senha.setter
    def senha(self, senha):
        self.__senha = senha

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao

    @property
    def isAdmin(self):
        return self.__isAdmin

    @isAdmin.setter
    def isAdmin(self, isAdmin):
        self.__isAdmin = isAdmin

    @property
    def apiKey(self):
        return self.__apiKey

    @apiKey.setter
    def apiKey(self, apiKey):
        self.__apiKey = apiKey