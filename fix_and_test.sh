#!/bin/bash

echo "🧹 Limpando caches Python..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

echo "🔍 Verificando imports nos arquivos de rota..."

# Lista de arquivos para verificar/corrigir
files=(
    "server/routes/auth.py"
    "server/routes/usuarios.py"
    "server/routes/professores.py"
    "server/routes/disciplinas.py"
    "server/routes/turmas.py"
    "server/routes/horarios.py"
    "server/routes/espacos.py"
    "server/routes/reservas.py"
    "server/routes/professor_disciplinas.py"
    "server/routes/turnos.py"
    "server/crud_new.py"
    "server/utils.py"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Verificando $file..."
        
        # Verificar se há imports relativos que precisam ser corrigidos
        if grep -q "from \\.database" "$file" 2>/dev/null; then
            echo "  ❌ Encontrado import relativo em $file"
            sed -i 's/from \.database/from server.database/g' "$file"
            echo "  ✅ Corrigido"
        fi
        
        if grep -q "from \\. import" "$file" 2>/dev/null; then
            echo "  ❌ Encontrado import relativo em $file"
            sed -i 's/from \. import/from server import/g' "$file"
            echo "  ✅ Corrigido"
        fi
        
        if grep -q "from \\." "$file" 2>/dev/null; then
            echo "  ⚠️  Possível import relativo em $file (verificar manualmente)"
        fi
    else
        echo "  ⚠️  Arquivo $file não encontrado"
    fi
done

echo "🏗️ Reconstruindo Docker..."
docker compose build --no-cache api

echo "🚀 Iniciando containers..."
docker compose up -d

echo "⏳ Aguardando 10 segundos para inicialização..."
sleep 10

echo "🧪 Testando API..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "erro")

if [ "$response" = "200" ]; then
    echo "✅ API funcionando! Status: $response"
    echo "📚 Documentação disponível em: http://localhost:8000/docs"
    echo "🎯 Endpoints principais:"
    echo "  - GET /turnos - Listar turnos"
    echo "  - POST /turnos - Criar turno"
    echo "  - GET /usuarios - Listar usuários"
    echo "  - POST /auth/register - Registrar usuário"
else
    echo "❌ API não está respondendo. Status: $response"
    echo "📋 Verificando logs..."
    docker compose logs api --tail 20
fi

echo "✨ Prune completo finalizado!"
