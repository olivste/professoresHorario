# API de Professores e Horários

Uma API REST desenvolvida em Python com FastAPI para gerenciar professores e seus horários.

## Características

- **FastAPI**: Framework web moderno e rápido
- **PostgreSQL**: Banco de dados relacional
- **Docker**: Containerização da aplicação
- **SQLAlchemy**: ORM para Python
- **Pydantic**: Validação de dados
- **CORS**: Suporte para Cross-Origin Resource Sharing

## Estrutura do Projeto

```
professoresHorario/
├── client/              # Frontend (Next.js)
├── server/              # API FastAPI
│   ├── main.py           # Aplicação principal FastAPI
│   ├── config.py         # Configurações via variáveis de ambiente
│   ├── database/         # Configuração do banco + modelos SQLAlchemy
│   └── routes/           # Rotas da API
├── docker-compose.yml    # Configuração Docker Compose
├── .env                  # Variáveis de ambiente
└── README.md             # Este arquivo
```

## Executando a Aplicação

### Pré-requisitos
- Docker
- Docker Compose

### Iniciando os serviços

1. Clone o repositório:
```bash
git clone <repository-url>
cd professoresHorario
```

2. Inicie os containers:
```bash
docker-compose up -d
```

3. A API estará disponível em: http://localhost:8000

4. Documentação automática (Swagger): http://localhost:8000/docs

5. Documentação alternativa (ReDoc): http://localhost:8000/redoc

### Parando os serviços
```bash
docker-compose down
```

### Para limpar os dados do banco
```bash
docker-compose down -v
```

## Endpoints da API

### Professores

- `GET /professores/` - Lista todos os professores
- `POST /professores/` - Cria um novo professor
- `GET /professores/{id}` - Busca professor por ID
- `PUT /professores/{id}` - Atualiza professor
- `DELETE /professores/{id}` - Remove professor

### Horários

- `GET /horarios/` - Lista todos os horários
- `POST /professores/{id}/horarios/` - Cria horário para um professor
- `GET /professores/{id}/horarios/` - Lista horários de um professor
- `PUT /horarios/{id}` - Atualiza horário
- `DELETE /horarios/{id}` - Remove horário

## Exemplos de Uso

### Criando um professor
```bash
curl -X POST "http://localhost:8000/professores/" \
     -H "Content-Type: application/json" \
     -d '{
       "nome": "João Silva",
       "email": "joao.silva@universidade.com",
       "telefone": "(11) 99999-9999",
       "departamento": "Ciência da Computação",
       "especializacao": "Inteligência Artificial"
     }'
```

### Criando um horário
```bash
curl -X POST "http://localhost:8000/professores/1/horarios/" \
     -H "Content-Type: application/json" \
     -d '{
       "dia_semana": "Segunda",
       "hora_inicio": "08:00",
       "hora_fim": "10:00",
       "disciplina": "Algoritmos",
       "sala": "Lab 101",
       "observacoes": "Aula prática"
     }'
```

## Configuração do Banco de Dados

O PostgreSQL está configurado com:
- **Host**: postgres (interno do Docker)
- **Porta**: 5432
- **Database**: professores_db
- **Usuário**: postgres
- **Senha**: postgres123

Para acessar o banco externamente, use localhost:5432.

## Variáveis de Ambiente

Configuradas no arquivo `.env`:

- `DATABASE_URL`: URL de conexão com o PostgreSQL
- `SECRET_KEY`: Chave secreta (defina em produção)
- `DEBUG`: Modo debug (True/False)
- `ALLOWED_ORIGINS`: Origens permitidas para CORS (separe por vírgula)
- `AUTO_CREATE_TABLES`: Cria tabelas automaticamente (use apenas em desenvolvimento)
- `CREATE_DEFAULT_ADMIN`: Cria usuário admin padrão no startup (use apenas em desenvolvimento)
- `DEFAULT_ADMIN_USERNAME`: Nome do usuário admin padrão
- `DEFAULT_ADMIN_PASSWORD`: Senha do usuário admin padrão

## Desenvolvimento

### Executando sem Docker
```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
export DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/professores_db"

# Executar a aplicação
uvicorn server.main:app --reload
```

### Adicionando novas dependências
1. Adicione ao `requirements.txt`
2. Reconstrua a imagem Docker:
```bash
docker-compose build
```

## Logs

Para visualizar os logs dos containers:
```bash
# Logs da API
docker-compose logs api

# Logs do PostgreSQL
docker-compose logs postgres

# Logs em tempo real
docker-compose logs -f
```

## Troubleshooting

### Problemas de conexão com o banco
- Verifique se o container do PostgreSQL está rodando
- Aguarde alguns segundos para o banco inicializar completamente
- Verifique os logs: `docker-compose logs postgres`

### API não responde
- Verifique se o container da API está rodando
- Verifique os logs: `docker-compose logs api`
- Teste a saúde da aplicação: `curl http://localhost:8000/health`

## Produção (recomendações mínimas)

- Defina `SECRET_KEY` com valor seguro e desative `DEBUG`.
- Desative `AUTO_CREATE_TABLES` e use migrações (Alembic).
- Desative `CREATE_DEFAULT_ADMIN` e crie usuários administradores via fluxo seguro.
- Configure `ALLOWED_ORIGINS` com os domínios do frontend.

## Próximos Passos

- Implementar autenticação JWT
- Adicionar testes automatizados
- Implementar sistema de notificações
- Adicionar validações de conflito de horários
- Implementar sistema de backup automático
