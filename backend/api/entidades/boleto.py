class Boleto():
    def __init__(self, idRequerimento, dtRefRequerimento, valorTotal, dtEmissao, dtVencimento, dtBaixa, idCliente, situacao):
        self.__idRequerimento = idRequerimento
        self.__dtRefRequerimento = dtRefRequerimento
        self.__valorTotal = valorTotal
        self.__dtEmissao = dtEmissao
        self.__dtVencimento = dtVencimento
        self.__dtBaixa = dtBaixa
        self.__idCliente = idCliente
        self.__situacao = situacao

    @property
    def idRequerimento(self):
        return self.__idRequerimento

    @idRequerimento.setter
    def idRequerimento(self, idRequerimento):
        self.__idRequerimento = idRequerimento

    @property
    def dtRefRequerimento(self):
        return self.__dtRefRequerimento

    @dtRefRequerimento.setter
    def dtRefRequerimento(self, dtRefRequerimento):
        self.__dtRefRequerimento = dtRefRequerimento

    @property
    def valorTotal(self):
        return self.__valorTotal

    @valorTotal.setter
    def valorTotal(self, valorTotal):
        self.__valorTotal = valorTotal

    @property
    def dtEmissao(self):
        return self.__dtEmissao

    @dtEmissao.setter
    def dtEmissao(self, dtEmissao):
        self.__dtEmissao = dtEmissao

    @property
    def dtVencimento(self):
        return self.__dtVencimento

    @dtVencimento.setter
    def dtVencimento(self, dtVencimento):
        self.__dtVencimento = dtVencimento

    @property
    def dtBaixa(self):
        return self.__dtBaixa

    @dtBaixa.setter
    def dtBaixa(self, dtBaixa):
        self.__dtBaixa = dtBaixa

    @property
    def idCliente(self):
        return self.__idCliente

    @idCliente.setter
    def idCliente(self, idCliente):
        self.__idCliente = idCliente

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao
