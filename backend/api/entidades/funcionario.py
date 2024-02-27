class Funcionario():
    def __init__(self, idUser, nome, idEquipe, situacao):
        self.__idUser = idUser
        self.__nome = nome
        self.__idEquipe = idEquipe
        self.__situacao = situacao

    @property
    def idUser(self):
        return self.__idUser

    @idUser.setter
    def idUser(self, idUser):
        self.__idUser = idUser

    @property
    def nome(self):
        return self.__nome

    @nome.setter
    def nome(self, nome):
        self.__nome = nome

    @property
    def idEquipe(self):
        return self.__idEquipe

    @idEquipe.setter
    def idEquipe(self, idEquipe):
        self.__idEquipe = idEquipe

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao
