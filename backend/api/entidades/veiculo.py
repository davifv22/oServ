class Veiculo():
    def __init__(self, modelo, marca, placa, kmRodados, idEquipe, situacao):
        self.__modelo = modelo
        self.__marca = marca
        self.__placa = placa
        self.__kmRodados = kmRodados
        self.__idEquipe = idEquipe
        self.__situacao = situacao

    @property
    def modelo(self):
        return self.__modelo

    @modelo.setter
    def modelo(self, modelo):
        self.__modelo = modelo

    @property
    def marca(self):
        return self.__marca

    @marca.setter
    def marca(self, marca):
        self.__marca = marca

    @property
    def placa(self):
        return self.__placa

    @placa.setter
    def placa(self, placa):
        self.__placa = placa

    @property
    def kmRodados(self):
        return self.__kmRodados

    @kmRodados.setter
    def kmRodados(self, kmRodados):
        self.__kmRodados = kmRodados

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