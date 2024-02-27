class Equipe():
    def __init__(self, descricao, idSetor, situacao):
        self.__descricao = descricao
        self.__idSetor = idSetor
        self.__situacao = situacao

    @property
    def descricao(self):
        return self.__descricao

    @descricao.setter
    def descricao(self, descricao):
        self.__descricao = descricao

    @property
    def idSetor(self):
        return self.__idSetor

    @idSetor.setter
    def idSetor(self, idSetor):
        self.__idSetor = idSetor

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao
