# UesPay

Sistema de carteira digital universitária para modernização do acesso e pagamento de serviços dentro da universidade, com foco inicial no Restaurante Universitário (RU) da UESPI.

---

## Sobre o Projeto

O **UesPay** é uma plataforma digital baseada em blockchain desenvolvida para facilitar pagamentos de serviços universitários utilizando créditos digitais (tokens). O projeto busca substituir métodos tradicionais, como fichas físicas e pagamentos presenciais, por uma solução moderna, prática e segura.

### Funcionalidades do MVP

- Consulta de saldo
- Atualização de saldo
- Histórico de transações
- Pagamento digital (refeição no RU via QR Code)
- Transferência de valores entre usuários
- Processamento de QR Code

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Flutter |
| **Backend** | TypeScript, Express, Node.js |
| **Blockchain** | Hyperledger FireFly |

---

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) (vem junto com o Node.js)
- [Hyperledger FireFly CLI](https://hyperledger.github.io/firefly/latest/gettingstarted/) (para o sandbox local de blockchain)

---

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/les-prp-uespi/uespay.git
cd uespay
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

> Os comandos a seguir devem ser executados dentro da pasta `backend/`.

As variáveis padrão já vêm configuradas para o ambiente local:

| Variável | Valor padrão | Descrição |
|----------|-------------|-----------|
| `PORT` | `3000` | Porta do servidor Express |
| `FIREFLY_URL` | `http://localhost:5000` | URL do sandbox local do FireFly |
| `FIREFLY_NAMESPACE` | `default` | Namespace do FireFly |

### 4. Iniciar o FireFly (blockchain)

Se for a **primeira vez**, crie a stack:

```bash
ff init uespay 1
```

Depois, inicie a stack:

```bash
ff start uespay
```

> Aguarde o FireFly subir completamente. O painel fica disponível em `http://localhost:5109`.

### 5. Iniciar o servidor

```bash
npm run dev
```

O servidor sobe na porta 3000 e inicializa o token pool automaticamente no FireFly.

### 6. Verificar os usuários simulados (opcional)

```bash
npm run seed
```

Exibe um relatório com os 10 usuários pré-cadastrados e seus saldos.

---

## Scripts disponíveis

> Execute dentro da pasta `backend/`.

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (hot-reload) |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor compilado (produção) |
| `npm run seed` | Exibe relatório dos usuários simulados |

---

## Rotas da API

### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/usuarios` | Lista todos os usuários |
| `GET` | `/api/usuarios/:id` | Busca usuário por ID |
| `POST` | `/api/usuarios` | Cadastra novo usuário |

### Saldo

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/saldo/:id/saldo` | Consulta saldo do usuário |
| `POST` | `/api/saldo/:id/recarga` | Adiciona créditos (recarga) |
| `POST` | `/api/saldo/:id/pagamento` | Debita saldo (pagamento) |

### Transações

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/transacoes/:userId/historico` | Histórico de transações |
| `POST` | `/api/transacoes/processar-qrcode` | Processa pagamento via QR Code |

---

## Estrutura do Projeto

```
uespay/
├── backend/                       # API Node.js + Express
│   ├── src/
│   │   ├── data/
│   │   │   └── users.ts           # Dados simulados de usuários
│   │   ├── middlewares/
│   │   │   └── error.middleware.ts # Tratamento de erros global
│   │   ├── routes/
│   │   │   ├── saldo.routes.ts    # Rotas de saldo e recarga
│   │   │   ├── transacoes.routes.ts # Rotas de transações e QR Code
│   │   │   └── usuarios.routes.ts # Rotas de cadastro/listagem
│   │   ├── services/
│   │   │   ├── carteira.service.ts # Lógica de negócio da carteira
│   │   │   ├── firefly.service.ts # Integração com Hyperledger FireFly
│   │   │   └── qrcode.service.ts  # Processamento de QR Code
│   │   ├── types/
│   │   │   └── index.ts           # Interfaces e tipos TypeScript
│   │   ├── utils/
│   │   │   └── seed.ts            # Script de seed
│   │   └── server.ts              # Ponto de entrada da aplicação
│   ├── package.json
│   └── tsconfig.json
├── frontend/                      # App Flutter (em desenvolvimento)
└── README.md
```

---

## Equipe

- Maria Rita Lustosa da Silva Nascimento
- Pedro Gabryel Araújo do Nascimento
- Filipe Costa Barbosa
- Juliana Mendes de Carvalho

### Orientador
- Alcemir Rodrigues Santos
