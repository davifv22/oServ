# Decisão técnica: Next.js Fullstack para o oServ SaaS

## Decisão

Para a nova versão SaaS multiempresa do oServ, a melhor arquitetura é concentrar frontend e backend no **Next.js Fullstack**, usando:

- Next.js App Router
- API Routes / Route Handlers
- Server Actions quando fizer sentido
- ORM para banco relacional
- autenticação por JWT/cookies seguros
- middleware para subdomínio e tenant

## Motivo

O projeto atual usa Angular no frontend e Express no backend. Para a fase SaaS, manter Express separado aumenta complexidade porque o sistema passa a exigir:

- autenticação unificada;
- leitura de subdomínio;
- isolamento por empresa;
- controle de assinatura;
- permissões por tela;
- limites por plano;
- onboarding;
- redirecionamento automático para subdomínio.

Com Next.js Fullstack, a aplicação fica mais simples de evoluir e publicar, porque frontend, API, autenticação e middleware ficam no mesmo projeto.

## O que acontece com o Express atual

O diretório `Express/` pode ser mantido temporariamente como referência durante a migração. Depois que as rotas forem migradas para `Next/app/api`, ele pode ser removido.

## O que acontece com o Angular

O diretório `Angular/` deve ser removido após a migração funcional das páginas principais.

## Fluxo de subdomínio

### Registro de empresa

1. Usuário acessa `seudominio.com/planos`.
2. Escolhe plano.
3. Vai para `seudominio.com/registro`.
4. Informa dados da empresa.
5. Sistema gera um slug/subdomínio, por exemplo: `grafica-davi`.
6. Backend salva a empresa com `subdomain = grafica-davi`.
7. Sistema cria o usuário OWNER.
8. Sistema cria assinatura inicial.
9. Usuário é redirecionado para:

```txt
grafica-davi.seudominio.com/login
```

### Login

1. Usuário informa e-mail/senha.
2. API identifica a empresa do usuário.
3. Se o login foi feito no domínio principal, redireciona para o subdomínio correto.
4. Se o login foi feito no subdomínio correto, entra no dashboard.

## Dados necessários no token

O token de autenticação deve conter:

```ts
{
  userId: string;
  companyId: string;
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  subdomain: string;
}
```

## Regra obrigatória de segurança

Toda rota autenticada deve filtrar dados por `companyId`.

Exemplo:

```ts
where: {
  companyId: auth.companyId
}
```

Nunca confiar apenas no parâmetro vindo do frontend.

## Limites por plano

Cada plano deve controlar:

- máximo de usuários;
- máximo de clientes;
- máximo de funcionários com acesso;
- máximo de ordens de serviço;
- recursos liberados.

## Tabelas essenciais

- companies
- users
- customers
- employees
- services
- service_orders
- subscription_plans
- subscriptions
- audit_logs

## Deploy recomendado

Para subdomínios dinâmicos, configurar DNS wildcard:

```txt
*.seudominio.com -> aplicação Next.js
```

Em produção, plataformas como Vercel, Render, Railway ou VPS com Nginx podem aceitar wildcard subdomains.
