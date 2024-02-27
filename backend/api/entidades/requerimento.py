class Requerimento():
    def __init__(self, dtRefRequerimento, nomeRequerente, endRequerente, endServico, docRequerente, idCliente, tipoRequerimento, observacao, situacao, dtRequerimento):
        self.__dtRefRequerimento = dtRefRequerimento
        self.__nomeRequerente = nomeRequerente
        self.__endRequerente = endRequerente
        self.__endServico = endServico
        self.__docRequerente = docRequerente
        self.__idCliente = idCliente
        self.__tipoRequerimento = tipoRequerimento
        self.__observacao = observacao
        self.__situacao = situacao
        self.__dtRequerimento = dtRequerimento

    @property
    def dtRefRequerimento(self):
        return self.__dtRefRequerimento

    @dtRefRequerimento.setter
    def dtRefRequerimento(self, dtRefRequerimento):
        self.__dtRefRequerimento = dtRefRequerimento

    @property
    def nomeRequerente(self):
        return self.__nomeRequerente

    @nomeRequerente.setter
    def nomeRequerente(self, nomeRequerente):
        self.__nomeRequerente = nomeRequerente

    @property
    def endRequerente(self):
        return self.__endRequerente

    @endRequerente.setter
    def endRequerente(self, endRequerente):
        self.__endRequerente = endRequerente

    @property
    def endServico(self):
        return self.__endServico

    @endServico.setter
    def endServico(self, endServico):
        self.__endServico = endServico

    @property
    def docRequerente(self):
        return self.__docRequerente

    @docRequerente.setter
    def docRequerente(self, docRequerente):
        self.__docRequerente = docRequerente

    @property
    def idCliente(self):
        return self.__idCliente

    @idCliente.setter
    def idCliente(self, idCliente):
        self.__idCliente = idCliente

    @property
    def tipoRequerimento(self):
        return self.__tipoRequerimento

    @tipoRequerimento.setter
    def tipoRequerimento(self, tipoRequerimento):
        self.__tipoRequerimento = tipoRequerimento

    @property
    def observacao(self):
        return self.__observacao

    @observacao.setter
    def observacao(self, observacao):
        self.__observacao = observacao

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao

    @property
    def dtRequerimento(self):
        return self.__dtRequerimento

    @dtRequerimento.setter
    def dtRequerimento(self, dtRequerimento):
        self.__dtRequerimento = dtRequerimento
