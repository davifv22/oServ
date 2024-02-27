class OrdemServico():
    def __init__(self, dtRefOS, idRequerimento, dtRefRequerimento, descricao, dtEmissao, dtInicio, dtTermino, idVeiculo, situacao, observacao):
        self.__dtRefOS = dtRefOS
        self.__idRequerimento = idRequerimento
        self.__dtRefRequerimento = dtRefRequerimento
        self.__descricao = descricao
        self.__dtEmissao = dtEmissao
        self.__dtInicio = dtInicio
        self.__dtTermino = dtTermino
        self.__idVeiculo = idVeiculo
        self.__situacao = situacao
        self.__observacao = observacao

    @property
    def dtRefOS(self):
        return self.__dtRefOS

    @dtRefOS.setter
    def dtRefOS(self, dtRefOS):
        self.__dtRefOS = dtRefOS

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
    def descricao(self):
        return self.__descricao

    @descricao.setter
    def descricao(self, descricao):
        self.__descricao = descricao

    @property
    def dtEmissao(self):
        return self.__dtEmissao

    @dtEmissao.setter
    def dtEmissao(self, dtEmissao):
        self.__dtEmissao = dtEmissao

    @property
    def dtInicio(self):
        return self.__dtInicio

    @dtInicio.setter
    def dtInicio(self, dtInicio):
        self.__dtInicio = dtInicio

    @property
    def dtTermino(self):
        return self.__dtTermino

    @dtTermino.setter
    def dtTermino(self, dtTermino):
        self.__dtTermino = dtTermino

    @property
    def idVeiculo(self):
        return self.__idVeiculo

    @idVeiculo.setter
    def idVeiculo(self, idVeiculo):
        self.__idVeiculo = idVeiculo

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao

    @property
    def observacao(self):
        return self.__observacao

    @observacao.setter
    def observacao(self, observacao):
        self.__observacao = observacao
