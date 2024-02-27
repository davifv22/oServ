class TipoRequerimento():
    def __init__(self, descricao, emiteOrcamento, emiteOS, situacao):
        self.__descricao = descricao
        self.__emiteOrcamento = emiteOrcamento
        self.__emiteOS = emiteOS
        self.__situacao = situacao

    @property
    def descricao(self):
        return self.__descricao

    @descricao.setter
    def descricao(self, descricao):
        self.__descricao = descricao

    @property
    def emiteOrcamento(self):
        return self.__emiteOrcamento

    @emiteOrcamento.setter
    def emiteOrcamento(self, emiteOrcamento):
        self.__emiteOrcamento = emiteOrcamento

    @property
    def emiteOS(self):
        return self.__emiteOS

    @emiteOS.setter
    def emiteOS(self, emiteOS):
        self.__emiteOS = emiteOS

    @property
    def situacao(self):
        return self.__situacao

    @situacao.setter
    def situacao(self, situacao):
        self.__situacao = situacao
