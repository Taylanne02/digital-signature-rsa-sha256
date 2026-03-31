# Assinador Digital Web

Atividade de Segurança de Sistema - Aplicação web desenvolvida com o objetivo de implementar um sistema de assinatura digital utilizando criptografia assimétrica (RSA) e hash SHA-256.

**Obs.: A atividade foi entregue e apresentada em 26/03/2026, contemplando todas as alterações solicitadas. Após essa data, o projeto passou a ser mantido e desenvolvido individualmente nesse novo repositório.**

------------------------------

# Descrição do Projeto

O sistema permite que usuários:

1. Realizem cadastro (geração automática de par de chaves).
2. Assinem digitalmente textos.
3. Verifiquem publicamente a validade de assinaturas digitais.
4. Baixem chaves públicas de todos os usuários
5. Baixem chaves privadas próprias.

Toda a aplicação utiliza persistência em banco de dados SQLite.

------------------------------

# Tecnologias Utilizadas

- Node.js
- Express
- SQLite
- Crypto (Node.js)
- HTML / JavaScript

------------------------------


# Como Executar o Projeto

    1- Clonar o repositório:

        git clone https://github.com/Taylanne02/Atividade-Assinador-Digital-Web.git
        cd Atividade-Assinador-Digital-Web

    2- Instalar dependências:

        1. npm install

        2. npm install bcrypt

    3- Executar o servidor:

        node server.js

        -> Servidor iniciará em: http://localhost:3000

------------------------------

# Fluxo da Aplicação
    1- Cadastro
        - Usuário informa:
            1. nome
            2. email
            3. senha
        - Sistema gera automaticamente:
            1. chave pública
            2. chave privada
        - Chaves são armazenadas no banco.

    2 - Login
        - Usuário informa:
            1. email
            2. senha
        - O sistema: 
            1. busca o usuário pelo email
            2. comapara a senha digitada com o hash salvo
            3. se válido:
                - salva sessão no navegador (localStorage)
                - redireciona para o menu

    3 - Menu principal
        - Usuário logado pode acessar:
            1. Assinar texto
            2. Minhas assinaturas
            3. Chaves públicas
            4. Minhas chaves
            5. Sair do sistema

    4 - Assinatura
        - Usuário digita um texto.
        - Confirma sua senha.

        - O sistema:
            1. Valida a senha
            2. Calcula hash SHA-256 do texto
            3. Assina o hash usando a chave privada do usuário
            4. Salva no banco:
                - texto
                - hash
                - assinatura
                - data
                - usuário
            5. Retorna o ID da assinatura.

    5 - Minhas assinaturas
        - Lista todas as assinaturas feitas pelo usuário logado.
        - Cada item possui:
            1. trecho do texto
            2. link para verificação
        - Leva para a página Verificação

    6 - Verificação
        - O sistema:
            1. Busca a assinatura pelo ID
            2. Busca a chave pública ou usuário
            3. Executa verificação criptografada
            4. Retorna:
                - VÁLIDA ou INVÁLIDA
                - Nome do usuário
                - Algoritmo utilizado
                - Data e hora da assinatura

    7 - Chaves públicas
        - Lista todos os usuários cadastrados
        - Permite baixar chave pública de qualquer usuário

    8 - Minhas chaves
        - Usuário logado pode:
            1. baixar sua chave privada
            2. confirmar senha antes do download
        - Apenas o dono logado com senha pode baixar sua chave privada.

# Endpoints da API

    ➜ Cadastro
    POST /register

    Body:
    {
    "nome": "Taylanne",
    "email": "tay@gmail.com",
    "senha":"123456"
    }

    Resposta:

    {
    "id": 1,
    "nome":"Taylanne",
    "message":"Usuário cadastrado com sucesso"
    }

------------------------------

    ➜ Login
    POST/login

    Body:
    {
    "email": "tay@gmail.com",
    "senha":"123456"
    }

    Resposta:

    {
    "message":"Login realizado",   
    "id": 1,
    "nome":"Taylanne"
    }

------------------------------

    ➜ Assinar texto
    POST/sign

    Body:
    {
    "userId": 1,
    "texto":"Mensagem importante"
    "senha":"123456"
    }

    Resposta:

    {
    "assinaturaId":"1",    
    "message":"Texto assinado com sucesso"
    }

------------------------------

    ➜ Verificar assinatura
    GET/verify/:id

    Exemplo: 
    GET/verify/1

    Resposta:

    {
    "resultado": "VALIDA",
    "usuario": "Taylanne",
    "algoritmo": "RSA + SHA256",
    "data": "2026-03-17T19:20:00.000Z"
    }

------------------------------

    ➜ Lista minhas assinaturas
    GET/my-signatures/:userId

    Resposta:
    [
    {
        "id": 1,
        "texto": "Mensagem importante",
        "data": "2026-03-17T19:20:00.000Z"
    }
    ]

------------------------------

    ➜ Lista chaves públicas
    GET/public-keys

    Resposta:
    [
    {
        "id": 1,
        "nome": "Taylanne",
        "publicKey": "-----BEGIN RSA PUBLIC KEY-----..."
    }
    ]
------------------------------
    ➜ Baixar chave pública
    GET/download-public-key/:id

    Baixa o arquivo publicKey.pem

------------------------------

    ➜ Baixar chave privada
    POST/download-private-key

    Body: 
    {
    "userId": 1,
    "senha": "123456"
    }

    Resposta:
    {
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----..."
    }

------------------------------

# Banco de Dados

    O banco SQLite é criado automaticamente ao iniciar o sistema.

    Tabelas:
        users → usuários e chaves
        signatures → assinaturas digitais
        logs → histórico de verificações

    Arquivo ignorado no Git:
        database.db

------------------------------

# Casos de Teste

    1- Teste Positivo (Assinatura Válida)
        Registrar usuário.
        Assinar um texto.
        Acessar /verify/:id.

        Resultado esperado:

        VALIDA
        
    2- Teste Negativo (Assinatura Alterada)
        Criar assinatura válida.

        Alterar o texto no banco:
            UPDATE signatures
            SET texto = 'texto alterado'
            WHERE id = 1;

        Verificar novamente.
        Resultado esperado:
            INVALIDA
        Motivo: alteração do conteúdo modifica o hash SHA-256.

# Arquivos Ignorados

    Definidos no .gitignore:
        node_modules/
        .env
        database.db

------------------------------

# Assinaturas no sistema
![Assinaturas](Imagens/Assinaturas.png)

---

# Exemplo de Assinatura Válida
![Assinatura válida](Imagens/Assinatura-valida.png)

---

# Exemplo de Assinatura Inválida
![Assinatura inválida](Imagens/Assinatura-invalida.png)

------------------------------

# Atualizações escritas do Projeto

1. 28/03/2026: Adição de arquivos CSS para aprimorar a estilização do site, proporcionando uma interface mais organizada e visualmente atraente.

2. 30/03/2026: Continuação das melhorias no Frontend com a implementação de novos estilos em CSS, visando uma experiência mais moderna, responsiva e agradável ao usuário.

3. 31/03/2026: Adição de arquivos CSS para aprimorar a estilização do site.

------------------------------