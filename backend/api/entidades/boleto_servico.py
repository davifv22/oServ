class BoletoServico():
    def __init__(self, idServico, valor, dtVencimento, complemento, situacao):
        self.__idServico = idServico
        self.__valor = valor
        self.__dtVencimento = dtVencimento
        self.__complemento = complemento
        self.__situacao = situacao

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

    @property
    def dtVencimento(self):
        return self.__dtVencimento

    @dtVencimento.setter
    def dtVencimento(self, dtVencimento):
        self.__dtVencimento = dtVencimento

    @property
    def complemento(self):
        return self.__complemento

    @complemento.setter
    def complemento(self, complemento):
        self.__complemento = complemento

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao

