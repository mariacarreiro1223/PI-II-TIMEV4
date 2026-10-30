# PI-II-TIMEV4
Repositório do Sistema De Acompanhamento De Demandas De Desenvolvimento; Turma 103 e Grupo V4 - Projeto Integrador II, Engenharia de Software; Instituição PUC Campinas

---

## Alunos Participantes

Abaixo estão os membros da equipe que desenvolveram este projeto:

* **Alexandre Carvalhinho Pavani**
* **Isaque Ryo Cruz Tanno**
* **Maria Eduarda Gonçalves Carreiro**
* **Thomas Lazarini wecke**


## Professor Responsavel:
* **fernando luiz


## Instalações:
Pré-requisitos

 - Node.js (versão LTS).
 - MySQL.
 - Visual Studio Code (recomendado).

1. Instalar as dependências

Abra a pasta do projeto no VS Code e execute no terminal:
npm install

2. Configurar o banco de dados

 - Abra o MySQL Workbench ou outra ferramenta de gerenciamento MySQL.
 - Abra o arquivo script_banco.sql, localizado na raiz do projeto.
 - Execute o script para criar o banco de dados gerencia_demandas e suas tabelas.

    Atenção: o script cria a estrutura do banco, mas não cadastra automaticamente usuários, projetos ou demandas.

3. Configurar as variáveis de ambiente

    Crie um arquivo chamado .env na raiz do projeto e preencha com os dados do seu ambiente:

    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=gerencia_demandas
    API_FERIADOS_KEY=sua_chave_aqui

    Substitua seu_usuario e sua_senha pelas credenciais do seu MySQL. A chave da API de feriados deve ser obtida em FeriadosAPI.

    Não coloque aspas ou ponto e vírgula nos valores. Não compartilhe o arquivo .env nem envie suas credenciais ao GitHub.

4. Iniciar o servidor

    No terminal, execute:
        npm start

    Se a inicialização ocorrer corretamente e o servidor estiver configurado na porta 3000, acesse:
        http://localhost:3000/

    A resposta esperada será:
        Sistema SADD

5. Testar as rotas da API
    As rotas podem ser testadas utilizando o Thunder Client, no VS Code, ou outra ferramenta para realizar requisições HTTP.