# Assinador Digital Web

Atividade de Segurança de Sistema - Aplicação web desenvolvida com o objetivo de implementar um sistema de assinatura digital utilizando criptografia assimétrica (RSA) e hash SHA-256.

Dupla:
- Taylanne Castelo Branco Cavalcante
- Yngrind

------------------------------

# Descrição do Projeto

O sistema permite que usuários:

1. Realizem cadastro (geração automática de par de chaves).
2. Assinem digitalmente textos.
3. Verifiquem publicamente a validade de assinaturas digitais.

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

        npm install

    3- Executar o servidor:

        node server.js

        Servidor iniciará em: http://localhost:3000

------------------------------

# Fluxo da Aplicação
    1- Cadastro
        - Usuário informa nome.
        - Sistema gera automaticamente:
            - chave pública
            - chave privada
        - Chaves são armazenadas no banco.

    2- Assinatura
        - Usuário digita um texto.
        - Sistema:
            1. Calcula hash SHA-256
            2. Assina usando chave privada
            3. Salva assinatura no banco
            4. Retorna ID da assinatura

    3- Verificação
        - Qualquer pessoa acessa /verify/:id
        - O sistema verifica a assinatura usando a chave pública.
        - Resultado exibido:
            - VÁLIDA ou INVÁLIDA
            - signatário
            - algoritmo
            - data/hora

# Endpoints da API
    ➜ Cadastro
    POST /register

    Body:
    {
    "nome": "Taylanne"
    }

    Resposta:

    {
    "id": 1
    }
------------------------------
    ➜ Assinar Texto
    POST /sign

    Body:

    {
    "userId": 1,
    "texto": "Mensagem importante"
    }

    Resposta:

    {
    "assinaturaId": 1
    }
------------------------------
    ➜ Verificar Assinatura
    GET /verify/:id

    Exemplo:

    GET /verify/1

    Resposta:

    {
    "resultado": "VALIDA",
    "usuario": "Taylanne",
    "algoritmo": "RSA + SHA256",
    "data": "2026-03-17"
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