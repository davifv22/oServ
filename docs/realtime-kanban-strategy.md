# Estratégia de atualização em tempo real do Kanban

## Decisão inicial

Para a primeira versão funcional do oServ SaaS, o Kanban de ordens de serviço será atualizado em tempo real usando **polling leve**.

## Por que polling primeiro?

O projeto está migrando para Next.js fullstack com Docker e MySQL. Polling é a opção mais simples, robusta e compatível com qualquer ambiente inicial de deploy, sem exigir servidor WebSocket separado.

## Como funciona

A página `/ordens-servico` chama periodicamente:

```txt
GET /api/service-orders
```

Intervalo recomendado inicial:

```txt
5 segundos
```

Quando uma OS é movida no Kanban:

```txt
PATCH /api/service-orders/:id/status
```

Depois disso, o frontend atualiza o estado local imediatamente e o polling mantém todos os usuários sincronizados.

## Evolução futura

Quando o sistema estiver em produção e com mais usuários simultâneos, pode evoluir para:

- WebSocket dedicado;
- Socket.IO;
- SSE;
- Redis Pub/Sub;
- serviço externo real-time.

## Motivo para não iniciar com WebSocket

Em Next.js, especialmente em ambientes serverless, WebSocket exige cuidados extras de infraestrutura. Como o projeto também usa Docker, WebSocket é possível no futuro, mas adicionaria complexidade antes do CRUD e autenticação estarem 100% estáveis.
