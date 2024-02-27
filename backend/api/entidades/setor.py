class Setor():
    def __init__(self, descricao):
        self.__descricao = descricao

    @property
    def descricao(self):
        return self.__descricao

    @descricao.setter
    def descricao(self, descricao):
        self.__descricao = descricao

