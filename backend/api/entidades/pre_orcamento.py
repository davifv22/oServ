class PreOrcamento():
    def __init__(self, idServico, valor):
        self.__idServico = idServico
        self.__valor = valor

    @property
    def idServico(self):
        return self.__idServico

    @idServico.setter
    def idServico(self, idServico):
        self.__idServico = idServico


    @property
    def valor(self):
        return self.__valor

    @valor.setter
    def valor(self, valor):
        self.__valor = valor