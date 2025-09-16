# Finance API

API de Instituição Financeira (Open Finance) desenvolvida em **Node.js**, **Express** e **MongoDB**.

------------------------------------------------------------------------

## 📌 Descrição

Esta aplicação simula uma **API financeira** com funcionalidades de criação de clientes, abertura de contas, movimentações financeiras (depósitos/saques), consulta de saldo, extrato e autorização de compartilhamento de dados (Open Finance).

O projeto segue a arquitetura **MVC (Model-View-Controller)** e está estruturado em **controllers**, **services**, **models** e **routes**, garantindo escalabilidade e boas práticas.

------------------------------------------------------------------------

## 🚀 Tecnologias Utilizadas

-   **Node.js**
-   **Express**
-   **MongoDB & Mongoose**
-   **Nodemon**

------------------------------------------------------------------------

## 📂 Estrutura do Projeto

    FINANCE-API/
    │── controllers/        # Lógica dos endpoints
    │   ├── accountController.js
    │   ├── customerController.js
    │
    │── models/             # Modelos do banco de dados
    │   ├── Account.js
    │   ├── Customer.js
    │   ├── Transaction.js
    │
    │── routes/             # Definição das rotas
    │   ├── accountRoutes.js
    │   ├── customerRoutes.js
    │
    │── services/           # Regras de negócio
    │   ├── accountService.js
    │   ├── customerService.js
    │
    │── scripts/            # Scripts utilitários
    │   ├── seed.js         # Popular o banco com dados iniciais
    │
    │── utils/              # Funções auxiliares
    │   ├── validators.js
    │
    │── .env                # Configurações gerais
    │── index.js            # Ponto de entrada da aplicação
    │── server.js           # Configuração do Express
    │── package.json        # Dependências e scripts

------------------------------------------------------------------------

## ⚙️ Instalação e Configuração

### 1️⃣ Pré-requisitos

-   Node.js (\>= 18)
-   MongoDB (local ou Atlas)

### 2️⃣ Clonar o repositório

``` bash
git clone https://github.com/seu-usuario/finance-api.git
cd finance-api
```

### 3️⃣ Instalar dependências

``` bash
npm install
```

### 4️⃣ Configurar variáveis de ambiente

Crie um arquivo **.env** na raiz do projeto com:

    MONGO_URI=mongodb://127.0.0.1:27017/finance_api
    PORT=3000
    CLEAR_DB=true

### 5️⃣ Rodar a aplicação

- Popular banco de dados (opcional)
``` bash
npm run seed
```
-   Ambiente de desenvolvimento:
``` bash
npm run dev
```

------------------------------------------------------------------------

## 📌 Endpoints Principais

#### 👤 Clientes (`/api/customers`)

-   **POST /** → Criar cliente
    **Exemplo de body:**

    ``` json
    {
      "name": "Maria Oliveira",
      "cpf": "123.456.789-00",
      "email": "maria@email.com"
    }
    ```

#### 🏦 Contas (`/api/accounts`)

-   **POST /** → Criar conta
-   **GET /:id/balance** → Consultar saldo
-   **POST /:id/transactions** → Criar transação (depósito/saque)
-   **GET /:id/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD** → Extrato de transações
-   **PATCH /:id/authorization** → Atualizar autorização de compartilhamento de dados
-   **GET /:id** → Compartilhamento de dados (com ou sem dados do cliente, de acordo com autorização)

------------------------------------------------------------------------

## 🧪 Exemplo de Requisição

#### Criar Conta

``` bash
POST http://localhost:3000/api/accounts
Content-Type: application/json

{
  "customerId": "650c82f4c1e8c4f7e4d8d111",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "initialBalance": 1000,
  "bankId": "BANK_A",
  "sharingAllowed": true
}
```

#### Criar Transação

``` bash
POST http://localhost:3000/api/accounts/:id/transactions
Content-Type: application/json

{
  "date": "2025-09-15",
  "description": "Pagamento",
  "amount": 200,
  "type": "debit",
  "category": "Income"
}
```

------------------------------------------------------------------------

## ✅ Regras de Negócio

-   Cada cliente deve possuir **CPF único**.
-   Contas são vinculadas a um cliente e possuem **Agência + Número da conta único**.
-   Transações devem ter **data no formato ISO (YYYY-MM-DD)**.
-   Não é permitido **Saque acima do saldo disponível**.
-   Somente quando `sharingAllowed=true`, os dados completos da conta/cliente são exibidos.

------------------------------------------------------------------------

## 👨‍💻 Autor

Projeto desenvolvido por **Bruna Leticia dos Santos** - **[Github](https://github.com/Bruna-Leticia12)**