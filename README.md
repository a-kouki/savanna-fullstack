# Savanna

[Acessar o sistema](https://savanna-fullstack.vercel.app/)

Loja virtual full-stack para venda de roupas e camisas, com vitrine pública e painel administrativo completo. Construída com Next.js e Supabase, com pedidos finalizados por WhatsApp.

![Vitrine do Savanna]<img src="docs/images/1.png" width="700">
![Vitrine do Savanna](./docs/images/2.png)

## Sumário

- [Ferramentas](#ferramentas)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rotas](#rotas)
- [Cache](#cache)
- [Multi-imagem por produto](#multi-imagem-por-produto)
- [Categorias](#categorias)
- [Checkout por WhatsApp com cupom](#checkout-por-whatsapp-com-cupom)
- [Segurança](#segurança)
- [Banco de dados e backend](#banco-de-dados-e-backend)
- [Interface](#interface)

## Ferramentas

| Ferramenta | Uso no projeto |
| --- | --- |
| **Next.js** | App Router, route handlers, middleware/proxy e camada de cache |
| **Supabase** | Postgres, autenticação e funções SQL (RPC) |
| **Tailwind CSS** | Estilização e responsividade |
| **Cloudinary** | Upload e entrega de imagens e vídeos |
| **Upstash Redis** | Rate limiting |
| **Zustand** | Estado do carrinho, com persistência no navegador |
| **Sonner** | Notificações (toasts) |
| **Recharts** | Gráficos do dashboard de métricas |
| **WhatsApp** | Finalização do pedido |

## Variáveis de ambiente

Para rodar o projeto, você precisa de contas nos serviços abaixo:

- **Supabase**: banco de dados e autenticação
- **Upstash**: Redis para o rate limiting
- **Cloudinary**: upload de imagens e vídeos
- **Provedor de e-mail com SMTP**: envio do magic link de login (por exemplo, Gmail com senha de app)

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

Variáveis com o prefixo `NEXT_PUBLIC_` são enviadas ao navegador, então nunca devem conter segredos. Nunca faça commit do `.env.local`.

## Rotas

**Públicas**

| Rota | Descrição |
| --- | --- |
| `/products` | Listagem de produtos |
| `/categoria` | Lista de categorias |
| `/categoria/[nome-products]` | Produtos de uma categoria |
| `/cart` | Carrinho |

**Painel administrativo**

| Rota | Descrição |
| --- | --- |
| `/admin/banners` | Banners |
| `/admin/categories` | Categorias |
| `/admin/coupons` | Cupons |
| `/admin/metrics` | Métricas |
| `/admin/order` | Pedidos |
| `/admin/products` | Produtos |

## Cache

As leituras da camada de dados são cacheadas no servidor com `unstable_cache` e invalidadas por tag com `revalidateTag` sempre que o painel altera algo (produtos, categorias, banners etc.). O resultado é uma vitrine rápida, que continua refletindo as edições feitas no admin.

## Multi-imagem por produto

Cada produto aceita várias imagens. Elas são armazenadas como um array `JSONB` na tabela `products`, enviadas ao Cloudinary pelo painel e exibidas na vitrine.

A migração de imagem única para múltiplas imagens passou por todas as camadas: banco de dados, API, upload, painel administrativo e vitrine.

![Tela de edição de produto com várias imagens](docs/images/3.png)
![Tela de edição de produto com várias imagens](docs/images/4.png)

## Categorias

Produtos e categorias se relacionam de forma N:N, por meio de uma tabela de junção: um produto pode pertencer a várias categorias. As páginas de categoria são acessadas por `slug`, com URLs legíveis e estáveis.

## Checkout por WhatsApp com cupom

Sem gateway de pagamento: o pedido é fechado em conversa no WhatsApp.

1. O cliente monta o carrinho, que persiste no navegador (Zustand).
2. Aplica um cupom, que é validado no servidor.
3. O pedido é registrado no banco de forma atômica (veja [RPC atômica](#rpc-atômica-de-pedido-com-cupom)).
4. O cliente segue para o WhatsApp para finalizar a compra.

## Segurança

### Middleware/proxy

A proteção das rotas administrativas é centralizada no middleware/proxy, com o `protectAdmin` cuidando da verificação de acesso ao painel.

### Rate limiting com Redis

As requisições são limitadas por identificador em uma janela de tempo, usando Redis como contador compartilhado entre as instâncias da aplicação.

### Autenticação no servidor com `getUser()`

Nas verificações de acesso no servidor, a sessão é validada com `getUser()`, que confirma o token junto ao serviço de autenticação do Supabase. O `getSession()` lê apenas o cookie, sem essa confirmação.

### Fallback de IP

O rate limiting depende de descobrir o IP real do cliente. O tratamento do fallback evita que o limite seja burlado por headers forjados ou que todos os visitantes sem IP identificado dividam o mesmo contador.

## Banco de dados e backend

### RPC atômica de pedido com cupom

A função SQL `create_order_with_coupon` cria o pedido e aplica o cupom em uma única transação: ou tudo acontece, ou nada. Isso evita estados inconsistentes e usos de cupom além do permitido quando duas requisições chegam ao mesmo tempo.

### Cupons

Sistema completo de cupons, com desconto aplicável ao carrinho inteiro, a produtos específicos ou a categorias.

### Métricas

O dashboard do painel é alimentado pela RPC `get_metrics_dashboard`, que consolida várias métricas em uma única consulta SQL, em vez de várias chamadas somadas no servidor. Os gráficos são renderizados com Recharts.

**Métricas exibidas**

- Receita ao longo do tempo
- Produtos mais vendidos
- Tamanhos mais vendidos
- Forma de pagamento
- Pedidos por dia da semana
- Pedidos por horário

### Pedidos

A página de pedidos do painel oferece filtros, paginação e busca. Os pedidos feitos podem ser exportados para Excel diretamente pelo painel, para consulta e controle fora do sistema.

## Interface

O painel e a vitrine são responsivos, com padrão de breakpoints consistente entre os módulos.

![Interface do Savanna](docs/images/15.png)
![Interface do Savanna](docs/images/10.png)
![Interface do Savanna](docs/images/6.png)

### Grid de produtos

![Grid de produtos da vitrine](docs/images/11.png)
![Grid de produtos da vitrine](docs/images/12.png)

### Responsividade

![Vitrine em telas de tamanhos diferentes](docs/images/13.png)
![Vitrine em telas de tamanhos diferentes](docs/images/14.png)

### Speed-dial no mobile

No painel, a barra de navegação inferior ganha um speed-dial para as rotas que não cabem na tela.

![Speed-dial da navegação mobile do painel](docs/images/7.png)
