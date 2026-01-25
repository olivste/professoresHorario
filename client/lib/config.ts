// Environment variables for the client application

// API URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Authentication
export const TOKEN_NAME = 'professores_horario_token';

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  ME: '/auth/me',
  
  // Usuários
  USUARIOS: '/usuarios',
  
  // Professores
  PROFESSORES: '/professores',
  
  // Disciplinas
  DISCIPLINAS: '/disciplinas',
  
  // Turmas
  TURMAS: '/turmas',
  
  // Turnos
  TURNOS: '/turnos',
  
  // Períodos de Aula
  PERIODOS_AULA: '/periodos-aula',
  PERIODOS_AUTO_GERAR: '/periodos-aula/auto-gerar',
  PERIODOS_CLONAR: '/periodos-aula/clonar',
  PERIODOS_BATCH: '/periodos-aula/batch',
  
  // Horários
  HORARIOS: '/horarios',
  
  // Espaços
  ESPACOS: '/espacos',
  
  // Reservas
  RESERVAS: '/reservas',
  
  // Professor-Disciplinas
  PROFESSOR_DISCIPLINAS: '/professor-disciplinas',
};
