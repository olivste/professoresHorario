import { API_BASE_URL, TOKEN_NAME, ENDPOINTS } from './config';

class ApiClient {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_NAME) : null
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private handleUnauthorized() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_NAME)
      window.location.href = "/login"
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized()
        throw new Error("Não autorizado")
      }
      let message = `API Error: ${response.status}`
      try {
        const err = await response.json()
        if (err?.detail) message = Array.isArray(err.detail) ? err.detail[0]?.msg || message : err.detail
      } catch (_) {
        // ignore json parse failure
      }
      throw new Error(message)
    }

    return response.json() as Promise<T>
  }

  // Auth
  async login(username: string, senha: string) {
    interface TokenResponse {
      access_token: string;
      token_type: string;
    }
    
    const result = await this.request<TokenResponse>(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, senha }),
    })
    
    // Store token in localStorage if successful
    if (typeof window !== 'undefined' && result && result.access_token) {
      localStorage.setItem(TOKEN_NAME, result.access_token)
    }
    
    return result
  }

  async me() {
    return this.request(ENDPOINTS.ME)
  }
  
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_NAME)
    }
  }

    // Usuarios
  async getUsuarios() {
    return this.request(ENDPOINTS.USUARIOS)
  }

  async createUsuario(data: any) {
    return this.request(ENDPOINTS.USUARIOS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUsuario(id: number, data: any) {
    return this.request(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteUsuario(id: number) {
    return this.request(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: "DELETE",
    })
  }

    // Professores
  async getProfessores() {
    return this.request(ENDPOINTS.PROFESSORES)
  }

  async createProfessor(data: any) {
    return this.request(ENDPOINTS.PROFESSORES, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProfessor(id: number, data: any) {
    return this.request(`${ENDPOINTS.PROFESSORES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteProfessor(id: number) {
    return this.request(`${ENDPOINTS.PROFESSORES}/${id}`, {
      method: "DELETE",
    })
  }

    // Turnos
  async getTurnos() {
    return this.request(ENDPOINTS.TURNOS)
  }

  async createTurno(data: any) {
    return this.request(ENDPOINTS.TURNOS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTurno(id: number, data: any) {
    return this.request(`${ENDPOINTS.TURNOS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTurno(id: number) {
    return this.request(`${ENDPOINTS.TURNOS}/${id}`, {
      method: "DELETE",
    })
  }

  // Períodos de Aula
  async getPeriodosAula(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`${ENDPOINTS.PERIODOS_AULA}${params ? `?${params}` : ""}`)
  }

  async createPeriodoAula(data: any) {
    return this.request(ENDPOINTS.PERIODOS_AULA, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async autoGerarPeriodos(params: any) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`${ENDPOINTS.PERIODOS_AUTO_GERAR}?${queryParams}`, {
      method: "POST",
    })
  }

  async clonarPeriodos(params: any) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`${ENDPOINTS.PERIODOS_CLONAR}?${queryParams}`, {
      method: "POST",
    })
  }

  async createPeriodosBatch(data: any[]) {
    return this.request(ENDPOINTS.PERIODOS_BATCH, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Turmas
  async getTurmas() {
    return this.request(ENDPOINTS.TURMAS)
  }

  async createTurma(data: any) {
    return this.request(ENDPOINTS.TURMAS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTurma(id: number, data: any) {
    return this.request(`${ENDPOINTS.TURMAS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTurma(id: number) {
    return this.request(`${ENDPOINTS.TURMAS}/${id}`, {
      method: "DELETE",
    })
  }

  // Disciplinas
  async getDisciplinas() {
    return this.request(ENDPOINTS.DISCIPLINAS)
  }

  async createDisciplina(data: any) {
    return this.request(ENDPOINTS.DISCIPLINAS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateDisciplina(id: number, data: any) {
    return this.request(`${ENDPOINTS.DISCIPLINAS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteDisciplina(id: number) {
    return this.request(`${ENDPOINTS.DISCIPLINAS}/${id}`, {
      method: "DELETE",
    })
  }

  // Horários
  async getHorarios(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`${ENDPOINTS.HORARIOS}${params ? `?${params}` : ""}`)
  }

  async createHorario(data: any) {
    return this.request(ENDPOINTS.HORARIOS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateHorario(id: number, data: any) {
    return this.request(`${ENDPOINTS.HORARIOS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteHorario(id: number) {
    return this.request(`${ENDPOINTS.HORARIOS}/${id}`, {
      method: "DELETE",
    })
  }

  // Espaços
  async getEspacos() {
    return this.request(ENDPOINTS.ESPACOS)
  }

  async createEspaco(data: any) {
    return this.request(ENDPOINTS.ESPACOS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateEspaco(id: number, data: any) {
    return this.request(`${ENDPOINTS.ESPACOS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteEspaco(id: number) {
    return this.request(`${ENDPOINTS.ESPACOS}/${id}`, {
      method: "DELETE",
    })
  }

  // Reservas
  async getReservas() {
    return this.request(ENDPOINTS.RESERVAS)
  }

  async createReserva(data: any) {
    return this.request(ENDPOINTS.RESERVAS, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateReserva(id: number, data: any) {
    return this.request(`${ENDPOINTS.RESERVAS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteReserva(id: number) {
    return this.request(`${ENDPOINTS.RESERVAS}/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
