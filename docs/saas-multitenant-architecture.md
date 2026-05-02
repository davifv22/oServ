# Arquitetura SaaS Multiempresa - oServ

## Objetivo

Transformar o oServ em uma plataforma SaaS multiempresa, onde cada empresa contratante possui seus próprios dados, usuários, clientes, funcionários, planos e permissões.

## Regras principais

1. Cada empresa contratante terá um cadastro próprio.
2. Cada usuário sempre pertence a uma empresa (`companyId`).
3. Clientes podem ter login separado para acompanhar serviços, orçamentos e solicitações.
4. Funcionários cadastrados podem ou não ter acesso ao sistema.
5. O banco deve isolar os dados por empresa.
6. O primeiro cadastro cria:
   - empresa contratante;
   - usuário dono/admin;
   - assinatura inicial;
   - vínculo com plano escolhido.

## Perfis de usuário

| Perfil | Descrição |
| --- | --- |
| OWNER | Dono da empresa assinante |
| ADMIN | Administrador da empresa |
| EMPLOYEE | Funcionário com acesso opcional |
| CUSTOMER | Cliente com login próprio |

## Entidades recomendadas

### companies

Armazena as empresas assinantes do sistema.

Campos sugeridos:

- id
- name
- tradeName
- document
- email
- phone
- status
- createdAt
- updatedAt

### users

Armazena todos os usuários que acessam o sistema.

Campos sugeridos:

- id
- companyId
- name
- email
- passwordHash
- role
- status
- lastLoginAt
- createdAt
- updatedAt

### customers

Armazena os clientes finais de cada empresa.

Campos sugeridos:

- id
- companyId
- userId nullable
- name
- document
- email
- phone
- createdAt
- updatedAt

Quando `userId` estiver preenchido, o cliente possui login no portal.

### employees

Armazena funcionários de cada empresa.

Campos sugeridos:

- id
- companyId
- userId nullable
- name
- document
- email
- phone
- position
- hasSystemAccess
- createdAt
- updatedAt

Quando `hasSystemAccess = true`, deve existir um usuário vinculado em `users`.

### subscription_plans

Planos disponíveis para contratação.

Campos sugeridos:

- id
- name
- description
- monthlyPrice
- annualPrice
- maxUsers
- maxCustomers
- maxOrders
- features
- isActive

### subscriptions

Assinatura ativa ou histórica de uma empresa.

Campos sugeridos:

- id
- companyId
- planId
- billingCycle
- status
- startedAt
- expiresAt
- canceledAt

## Isolamento multiempresa

Toda consulta operacional deve filtrar por `companyId`.

Exemplo:

```ts
where: {
  companyId: req.user.companyId
}
```

Nunca buscar clientes, funcionários, ordens ou financeiro sem aplicar `companyId`.

## Fluxo de primeiro registro

1. Usuário acessa `/planos`.
2. Escolhe plano mensal ou anual.
3. Vai para `/registro?plan=starter&cycle=monthly`.
4. Preenche dados da empresa.
5. Preenche dados do administrador.
6. Backend cria empresa, usuário OWNER e assinatura.
7. Sistema redireciona para login ou dashboard.

## Rotas frontend planejadas

- `/planos`
- `/registro`
- `/login`
- `/dashboard`
- `/clientes`
- `/funcionarios`
- `/assinatura`
- `/configuracoes/empresa`

## Rotas backend recomendadas

- `POST /api/auth/register-company`
- `POST /api/auth/login`
- `GET /api/subscription-plans`
- `POST /api/customers`
- `POST /api/customers/:id/create-access`
- `POST /api/employees`
- `POST /api/employees/:id/create-access`
- `GET /api/me`

## Observações importantes

- Usar JWT com `companyId`, `userId` e `role`.
- Senhas devem ser salvas com hash, nunca texto puro.
- O frontend Next.js pode consumir a API Express atual.
- O backend Express deve ser adaptado para sempre validar tenant/empresa.
