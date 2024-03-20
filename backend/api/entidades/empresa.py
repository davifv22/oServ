class Empresa():
    def __init__(self, nomeEmpresa, dtRefSistema, dtImplantacao, endereco, cidade, cnpj):
        self.__nomeEmpresa = nomeEmpresa
        self.__dtRefSistema = dtRefSistema
        self.__dtImplantacao = dtImplantacao
        self.__endereco = endereco
        self.__cidade = cidade
        self.__cnpj = cnpj

    @property
    def nomeEmpresa(self):
        return self.__nomeEmpresa

    @nomeEmpresa.setter
    def nomeEmpresa(self, nomeEmpresa):
        self.__nomeEmpresa = nomeEmpresa

    @property
    def dtRefSistema(self):
        return self.__dtRefSistema

    @dtRefSistema.setter
    def dtRefSistema(self, dtRefSistema):
        self.__dtRefSistema = dtRefSistema
        
    @property
    def dtImplantacao(self):
        return self.__dtImplantacao
    
    @dtImplantacao.setter
    def dtImplantacao(self, dtImplantacao):
        self.__dtImplantacao = dtImplantacao

    @property
    def endereco(self):
        return self.__endereco

    @endereco.setter
    def endereco(self, endereco):
        self.__endereco = endereco

    @property
    def cidade(self):
        return self.__cidade

    @cidade.setter
    def cidade(self, cidade):
        self.__cidade = cidade

    @property
    def cnpj(self):
        return self.__cnpj

    @cnpj.setter
    def cnpj(self, cnpj):
        self.__cnpj = cnpj
