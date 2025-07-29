#!/usr/bin/env python3
"""
Script para importar dados do CSV MAPAHorariosEOH.csv para a API
"""

import pandas as pd
import requests
import json
import re
from typing import Dict, List, Tuple, Optional

class ImportadorCSV:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.professores_cache = {}
        self.disciplinas_cache = {}
        self.turmas_cache = {}
        
    def processar_csv(self, caminho_csv: str):
        """Processa o arquivo CSV e extrai dados estruturados"""
        print(f"🔄 Processando arquivo: {caminho_csv}")
        
        # Ler o CSV com encoding adequado
        try:
            df = pd.read_csv(caminho_csv, sep=';', encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(caminho_csv, sep=';', encoding='latin1')
        
        print(f"✅ Arquivo carregado: {len(df)} linhas, {len(df.columns)} colunas")
        
        # Identificar colunas de turmas
        colunas = df.columns.tolist()
        turmas_matutino = [col for col in colunas if 'M0' in col and 'Integral' in col]
        turmas_vespertino = [col for col in colunas if 'V0' in col]
        
        print(f"📊 Turmas encontradas:")
        print(f"   Matutino: {len(turmas_matutino)} turmas")
        print(f"   Vespertino: {len(turmas_vespertino)} turmas")
        
        # Extrair dados
        dados_extraidos = {
            'professores': set(),
            'disciplinas': set(),
            'turmas': [],
            'horarios': []
        }
        
        # Processar cada linha do CSV
        for idx, row in df.iterrows():
            disciplina = row.iloc[0]  # Primeira coluna é sempre a disciplina
            
            if pd.isna(disciplina) or disciplina.strip() == '' or '///' in str(disciplina):
                continue
                
            disciplina = str(disciplina).strip()
            dados_extraidos['disciplinas'].add(disciplina)
            
            # Processar turmas matutinas
            for i, turma_col in enumerate(turmas_matutino):
                if i < len(row) - 1:
                    celula = str(row.iloc[i + 1]) if not pd.isna(row.iloc[i + 1]) else ""
                    self._processar_celula(celula, disciplina, turma_col, dados_extraidos)
            
            # Processar turmas vespertinas (começam depois da segunda coluna "DISCIPLINAS")
            disciplinas_col_index = None
            for j, col in enumerate(colunas):
                if col == 'DISCIPLINAS' and j > 0:
                    disciplinas_col_index = j
                    break
            
            if disciplinas_col_index:
                for i, turma_col in enumerate(turmas_vespertino):
                    col_index = disciplinas_col_index + i + 1
                    if col_index < len(row):
                        celula = str(row.iloc[col_index]) if not pd.isna(row.iloc[col_index]) else ""
                        self._processar_celula(celula, disciplina, turma_col, dados_extraidos)
        
        return dados_extraidos
    
    def _processar_celula(self, celula: str, disciplina: str, turma: str, dados: dict):
        """Processa uma célula individual do CSV"""
        if not celula or celula == 'nan' or '///' in celula:
            return
            
        # Extrair professor e carga horária usando regex
        patterns = [
            r'(\d+)\s+([A-ZÁÉÍÓÚÃÕÇ\s]+)',  # "2 DELMA"
            r'([A-ZÁÉÍÓÚÃÕÇ\s]+)\s+(\d+)',  # "DELMA 2"
            r'(\d+)\s+\([TM]\)\s+([A-ZÁÉÍÓÚÃÕÇ\s]+)',  # "2 (T) ELIANE"
        ]
        
        professor = None
        carga_horaria = 1
        
        for pattern in patterns:
            match = re.search(pattern, celula.upper())
            if match:
                if pattern.startswith(r'(\d+)'):
                    carga_horaria = int(match.group(1))
                    professor = match.group(2).strip()
                else:
                    professor = match.group(1).strip()
                    carga_horaria = int(match.group(2))
                break
        
        if not professor:
            # Tentar extrair apenas o nome do professor
            nome_match = re.search(r'([A-ZÁÉÍÓÚÃÕÇ\s]+)', celula.upper())
            if nome_match:
                professor = nome_match.group(1).strip()
        
        if professor and professor not in ['NAN', '']:
            # Limpar nome do professor
            professor = re.sub(r'[^\w\s]', '', professor).strip()
            
            dados['professores'].add(professor)
            
            # Extrair informações da turma
            turma_info = self._extrair_info_turma(turma)
            if turma_info:
                dados['turmas'].append(turma_info)
                
                # Criar horário
                horario = {
                    'professor': professor,
                    'disciplina': disciplina,
                    'turma': turma_info['nome'],
                    'carga_horaria': carga_horaria,
                    'observacoes': f"Importado do CSV - Célula original: {celula}"
                }
                dados['horarios'].append(horario)
    
    def _extrair_info_turma(self, turma_col: str) -> Optional[Dict]:
        """Extrai informações da turma a partir do nome da coluna"""
        # Exemplos: "1°M01 Integral", "2°V01"
        match = re.search(r'(\d+)°([MV])(\d+)', turma_col)
        if match:
            ano = match.group(1) + "°"
            turno = "matutino" if match.group(2) == 'M' else "vespertino"
            numero = match.group(3)
            
            nome_turma = f"{ano}{match.group(2)}{numero}"
            curso = "Ensino Médio"
            
            if "integral" in turma_col.lower():
                curso = "Ensino Médio Integral"
            
            return {
                'nome': nome_turma,
                'ano': ano,
                'turno': turno,
                'curso': curso
            }
        return None
    
    def criar_usuarios_professores(self, professores: set):
        """Cria usuários e professores na API"""
        print(f"\n👥 Criando {len(professores)} professores...")
        
        for nome in professores:
            if not nome or len(nome) < 2:
                continue
                
            # Gerar email baseado no nome
            email = self._gerar_email(nome)
            
            # Dados do usuário
            usuario_data = {
                "nome": nome.title(),
                "email": email,
                "telefone": None,
                "role": "professor",
                "ativo": True,
                "senha": "123456"  # Senha padrão que deve ser alterada
            }
            
            # Dados do professor
            professor_data = {
                "departamento": "A definir",
                "especializacao": "A definir",
                "carga_horaria_semanal": 40,
                "observacoes": "Importado do CSV",
                "usuario": usuario_data
            }
            
            try:
                response = requests.post(
                    f"{self.api_base_url}/professores/",
                    json=professor_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    prof_data = response.json()
                    self.professores_cache[nome] = prof_data['id']
                    print(f"  ✅ {nome} -> ID: {prof_data['id']}")
                else:
                    print(f"  ❌ Erro ao criar {nome}: {response.text}")
                    
            except Exception as e:
                print(f"  ❌ Erro ao criar {nome}: {str(e)}")
    
    def criar_disciplinas(self, disciplinas: set):
        """Cria disciplinas na API"""
        print(f"\n📚 Criando {len(disciplinas)} disciplinas...")
        
        for nome in disciplinas:
            if not nome or len(nome) < 2:
                continue
                
            disciplina_data = {
                "nome": nome,
                "codigo": self._gerar_codigo_disciplina(nome),
                "carga_horaria_semanal": 2,
                "descricao": "Importado do CSV",
                "ativa": True
            }
            
            try:
                response = requests.post(
                    f"{self.api_base_url}/disciplinas/",
                    json=disciplina_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    disc_data = response.json()
                    self.disciplinas_cache[nome] = disc_data['id']
                    print(f"  ✅ {nome} -> ID: {disc_data['id']}")
                else:
                    print(f"  ❌ Erro ao criar {nome}: {response.text}")
                    
            except Exception as e:
                print(f"  ❌ Erro ao criar {nome}: {str(e)}")
    
    def criar_turmas(self, turmas: List[Dict]):
        """Cria turmas na API"""
        turmas_unicas = {}
        for turma in turmas:
            turmas_unicas[turma['nome']] = turma
        
        print(f"\n🏫 Criando {len(turmas_unicas)} turmas...")
        
        for turma_data in turmas_unicas.values():
            try:
                response = requests.post(
                    f"{self.api_base_url}/turmas/",
                    json=turma_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    turma_resp = response.json()
                    self.turmas_cache[turma_data['nome']] = turma_resp['id']
                    print(f"  ✅ {turma_data['nome']} -> ID: {turma_resp['id']}")
                else:
                    print(f"  ❌ Erro ao criar {turma_data['nome']}: {response.text}")
                    
            except Exception as e:
                print(f"  ❌ Erro ao criar {turma_data['nome']}: {str(e)}")
    
    def _gerar_email(self, nome: str) -> str:
        """Gera email baseado no nome"""
        nome_limpo = re.sub(r'[^\w\s]', '', nome.lower())
        partes = nome_limpo.split()
        if len(partes) > 1:
            return f"{partes[0]}.{partes[-1]}@escola.edu.br"
        else:
            return f"{partes[0]}@escola.edu.br"
    
    def _gerar_codigo_disciplina(self, nome: str) -> str:
        """Gera código da disciplina"""
        palavras = nome.split()
        if len(palavras) > 1:
            return ''.join([p[0].upper() for p in palavras[:3]])
        else:
            return nome[:3].upper()
    
    def executar_importacao(self, caminho_csv: str):
        """Executa a importação completa"""
        print("🚀 Iniciando importação do CSV...")
        
        # Processar CSV
        dados = self.processar_csv(caminho_csv)
        
        print(f"\n📊 Dados extraídos:")
        print(f"   Professores: {len(dados['professores'])}")
        print(f"   Disciplinas: {len(dados['disciplinas'])}")
        print(f"   Turmas únicas: {len(set(t['nome'] for t in dados['turmas']))}")
        print(f"   Horários: {len(dados['horarios'])}")
        
        # Criar dados na API
        self.criar_usuarios_professores(dados['professores'])
        self.criar_disciplinas(dados['disciplinas'])
        self.criar_turmas(dados['turmas'])
        
        print("\n✅ Importação concluída!")
        print(f"🔗 Acesse a API em: {self.api_base_url}/docs")

if __name__ == "__main__":
    importador = ImportadorCSV()
    importador.executar_importacao("/home/felip/projetos/professoresHorario/MAPAHorariosEOH.csv")
