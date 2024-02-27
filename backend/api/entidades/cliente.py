class Cliente():
    def __init__(self, nome, telefone, email, doc, endereco, bairro, cidade, cep, situacao, observacao, dtCadastro):
        self.__nome = nome
        self.__telefone = telefone
        self.__email = email
        self.__doc = doc
        self.__endereco = endereco
        self.__bairro = bairro
        self.__cidade = cidade
        self.__cep = cep
        self.__situacao = situacao
        self.__observacao = observacao
        self.__dtCadastro = dtCadastro

    @property
    def nome(self):
        return self.__nome

    @nome.setter
    def nome(self, nome):
        self.__nome = nome

    @property
    def telefone(self):
        return self.__telefone

    @telefone.setter
    def telefone(self, telefone):
        self.__telefone = telefone

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, email):
        self.__email = email

    @property
    def doc(self):
        return self.__doc

    @doc.setter
    def doc(self, doc):
        self.__doc = doc

    @property
    def endereco(self):
        return self.__endereco

    @endereco.setter
    def endereco(self, endereco):
        self.__endereco = endereco

    @property
    def bairro(self):
        return self.__bairro

    @bairro.setter
    def bairro(self, bairro):
        self.__bairro = bairro

    @property
    def cidade(self):
        return self.__cidade

    @cidade.setter
    def cidade(self, cidade):
        self.__cidade = cidade

    @property
    def cep(self):
        return self.__cep

    @cep.setter
    def cep(self, cep):
        self.__cep = cep

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

    @property
    def dtCadastro(self):
        return self.__dtCadastro

    @dtCadastro.setter
    def dtCadastro(self, dtCadastro):
        self.__dtCadastro = dtCadastro
