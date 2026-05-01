# oServ SaaS - Gestão de Ordens de Serviço

O **oServ SaaS** é uma plataforma multiempresa para gestão de ordens de serviço, clientes, funcionários, serviços, financeiro e acompanhamento operacional por Kanban.

A versão atual foi reestruturada para **Next.js Fullstack**, concentrando frontend, backend, autenticação, APIs e regras de negócio dentro da pasta `Next/`.

---

## Visão geral do produto

O oServ foi pensado para empresas que precisam organizar atendimentos, serviços e tarefas internas, como gráficas, papelarias, assistências técnicas, prestadores de serviço e equipes operacionais.

Com ele, cada empresa possui seu próprio ambiente isolado, com subdomínio, usuários internos, clientes, funcionários, serviços cadastrados e ordens de serviço controladas por status.

---

## Principais recursos

- SaaS multiempresa
- Subdomínio por empresa
- Registro de empresa
- Login com JWT e cookie HTTP-only
- Proteção de rotas via middleware
- CRUD de clientes
- CRUD de funcionários
- CRUD de serviços
- Ordens de serviço com Kanban
- Responsável por ordem de serviço
- Comentários dentro da OS
- Menções com `@usuario`
- Notificações internas
- Dashboard com cards e gráficos
- Perfil do usuário
- Perfil completo da empresa
- Configurações da empresa
- Docker com MySQL
- Prisma ORM

---

## Stack utilizada

- Next.js
- React
- TypeScript
- Prisma ORM
- MySQL
- Bootstrap
- Recharts
- JWT com `jose`
- bcryptjs
- Docker
- Docker Compose

---

## Estrutura principal

```txt
oServ/
├── Next/
│   ├── app/
│   │   ├── api/
│   │   ├── login/
│   │   ├── registro/
│   │   ├── planos/
│   │   └── (dashboard)/
│   ├── components/
│   ├── lib/
│   ├── prisma/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── docs/
```

> A aplicação atual roda pela pasta `Next/`.

---

# Inicialização com Docker

## 1. Subir aplicação e banco

Na raiz do repositório:

```bash
docker compose up --build
```

Isso deve subir:

- Aplicação Next.js em `http://localhost:3000`
- Banco MySQL em `localhost:3306`

## 2. Rodar migrations do Prisma

Em outro terminal:

```bash
docker compose exec app npx prisma migrate dev
```

## 3. Gerar Prisma Client

```bash
docker compose exec app npx prisma generate
```

## 4. Abrir Prisma Studio

```bash
docker compose exec app npx prisma studio
```

## 5. Ver logs da aplicação

```bash
docker compose logs -f app
```

## 6. Ver logs do banco

```bash
docker compose logs -f db
```

## 7. Entrar no container da aplicação

```bash
docker compose exec app sh
```

## 8. Entrar no MySQL do container

```bash
docker compose exec db mysql -u oserv -p oserv
```

Senha padrão esperada no compose:

```txt
oserv_password
```

## 9. Parar containers

```bash
docker compose down
```

## 10. Parar e apagar volume do banco

Use apenas quando quiser resetar tudo:

```bash
docker compose down -v
```

---

# Inicialização sem Docker

## 1. Entrar na pasta Next

```bash
cd Next
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Criar arquivo `.env`

Linux/macOS/Git Bash:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## 4. Configurar variáveis de ambiente

Exemplo de `.env`:

```env
DATABASE_URL="mysql://root:sua_senha@localhost:3306/oserv"
JWT_SECRET="troque-essa-chave-em-producao"
NEXT_PUBLIC_APP_DOMAIN="localhost"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. Criar banco MySQL local

Acesse seu MySQL e rode:

```sql
CREATE DATABASE oserv;
```

## 6. Rodar migrations

```bash
npx prisma migrate dev
```

## 7. Gerar Prisma Client

```bash
npx prisma generate
```

## 8. Iniciar em desenvolvimento

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

---

# Fluxo recomendado de teste

1. Acesse `/registro`.
2. Cadastre uma empresa.
3. Escolha um subdomínio.
4. Acesse `/login`.
5. Faça login com o email e senha cadastrados.
6. Cadastre clientes em `/clientes`.
7. Cadastre funcionários em `/funcionarios`.
8. Cadastre serviços em `/servicos`.
9. Crie uma ordem de serviço em `/ordens-servico`.
10. Mova a OS entre os status do Kanban.
11. Abra a OS e teste comentários.
12. Teste menções usando `@nome`.
13. Veja notificações internas.
14. Atualize dados em `/configuracoes`.
15. Atualize dados do usuário em `/perfil`.
16. Atualize dados da empresa em `/empresa`.

---

# Rotas principais

## Públicas

```txt
/login
/registro
/planos
```

## Dashboard protegido

```txt
/dashboard
/clientes
/funcionarios
/servicos
/ordens-servico
/ordens-servico/[id]
/financeiro
/configuracoes
/perfil
/empresa
```

---

# APIs principais

## Autenticação

```txt
POST /api/auth/register-company
POST /api/auth/login
POST /api/auth/logout
```

## Empresa e perfil

```txt
GET   /api/company
PATCH /api/company
GET   /api/profile
PATCH /api/profile
```

## Cadastros

```txt
GET    /api/customers
POST   /api/customers
PATCH  /api/customers
DELETE /api/customers?id=ID

GET    /api/employees
POST   /api/employees
PATCH  /api/employees
DELETE /api/employees?id=ID

GET    /api/services
POST   /api/services
PATCH  /api/services
DELETE /api/services?id=ID
```

## Ordens de serviço

```txt
GET    /api/service-orders
POST   /api/service-orders
PATCH  /api/service-orders
DELETE /api/service-orders?id=ID
```

Filtros:

```txt
GET /api/service-orders?status=OPEN
GET /api/service-orders?responsibleEmployeeId=ID
```

## Comentários e notificações

```txt
GET  /api/service-orders/[id]/comments
POST /api/service-orders/[id]/comments

GET   /api/notifications
PATCH /api/notifications
```

---

# Comandos JavaScript / Next.js

Execute dentro da pasta `Next/`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Explicação

```txt
npm install      instala as dependências
npm run dev      inicia ambiente de desenvolvimento
npm run build    gera build de produção
npm run start    roda a build de produção
npm run lint     executa verificação de lint
```

---

# Comandos Prisma

Execute dentro da pasta `Next/`:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate reset
npx prisma studio
npx prisma db push
npx prisma format
npx prisma validate
```

## Explicação

```txt
npx prisma generate       gera o Prisma Client
npx prisma migrate dev    cria/aplica migrations em desenvolvimento
npx prisma migrate reset  reseta o banco e reaplica migrations
npx prisma studio         abre interface visual do banco
npx prisma db push        sincroniza schema com banco sem migration formal
npx prisma format         formata o schema.prisma
npx prisma validate       valida o schema.prisma
```

> Em produção, prefira `prisma migrate deploy`.

```bash
npx prisma migrate deploy
```

---

# Comandos Docker

Na raiz do repositório:

```bash
docker compose up --build
docker compose up -d
docker compose down
docker compose down -v
docker compose logs -f app
docker compose logs -f db
docker compose exec app sh
docker compose exec app npx prisma migrate dev
docker compose exec app npx prisma generate
docker compose exec app npx prisma studio
docker compose exec db mysql -u oserv -p oserv
```

---

# Comandos MySQL úteis

Dentro do MySQL:

```sql
SHOW DATABASES;
USE oserv;
SHOW TABLES;
DESCRIBE Company;
DESCRIBE User;
DESCRIBE ServiceOrder;
SELECT * FROM Company;
SELECT * FROM User;
SELECT * FROM Customer;
SELECT * FROM Employee;
SELECT * FROM Service;
SELECT * FROM ServiceOrder;
```

Criar banco manualmente:

```sql
CREATE DATABASE oserv;
```

Apagar banco manualmente:

```sql
DROP DATABASE oserv;
```

Criar novamente:

```sql
CREATE DATABASE oserv;
```

---

# Subdomínio local

Para testar subdomínio local, use:

```txt
empresa.localhost:3000
```

Exemplos:

```txt
grafica.localhost:3000
papelaria.localhost:3000
```

O middleware valida o subdomínio do token e redireciona para a empresa correta quando necessário.

---

# Observações importantes

- O pagamento ainda será integrado futuramente.
- Para produção, configure `JWT_SECRET` forte.
- Para produção com subdomínios reais, configure DNS wildcard, por exemplo `*.seudominio.com`.
- Depois de alterar o `schema.prisma`, rode uma migration.
- O banco principal é MySQL.

---

# Status atual

O sistema possui base funcional completa para MVP SaaS:

- Frontend Next.js
- Backend via API Routes
- Prisma + MySQL
- Multiempresa
- Autenticação
- Proteção de rotas
- CRUDs principais
- Kanban de OS
- Comentários, menções e notificações

Próximas evoluções sugeridas:

- Deploy em produção
- Integração de pagamento
- Landing page comercial
- Relatórios avançados
- Upload de anexos em OS
- Drag and drop avançado no Kanban
