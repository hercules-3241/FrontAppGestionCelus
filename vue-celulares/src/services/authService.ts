// Autenticación por JWT: login contra /api/auth/login y sesión vía /api/auth/me
import { ref } from 'vue';

export interface User {
  username: string;
  name?: string;
  role?: 'ADMIN' | 'USUARIO';
  region?: string;
}

// Estructura que devuelve el backend en /api/auth/login y /api/auth/me
interface AuthResponse {
  token: string | null;
  tokenType?: string;
  username: string;
  rol: 'ADMIN' | 'USUARIO';
  region?: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Estado reactivo para la autenticación
const currentUser = ref<User | null>(null);
const authToken = ref<string | null>(null);
const isInitializing = ref<boolean>(true); // Maneja la carga inicial

class AuthService {
  constructor() {
    // Llamar la verificación asíncrona sin bloquear
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    console.log('🔄 Inicializando sistema de autenticación...');
    isInitializing.value = true;

    try {
      await this.checkExistingSession();
    } catch (error) {
      console.error('❌ Error durante inicialización de auth:', error);
      // En caso de error, limpiar sesión
      this.logout();
    } finally {
      isInitializing.value = false;
      console.log('✅ Inicialización de autenticación completa');
    }
  }

  private mapUser(data: AuthResponse): User {
    return {
      username: data.username,
      name: data.username,
      role: data.rol,
      region: data.region,
    };
  }

  private async checkExistingSession(): Promise<void> {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      console.log('📭 No hay sesión guardada');
      return;
    }

    authToken.value = savedToken;

    try {
      console.log('🔍 Recuperando sesión con /api/auth/me...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        currentUser.value = this.mapUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser.value));
        console.log('✅ Sesión recuperada:', currentUser.value);
      } else {
        // 401 = token vencido/ausente
        console.log('❌ Sesión expirada o inválida');
        this.logout();
      }
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      this.logout();
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    console.log('🔐 Iniciando proceso de login...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(10000), // Timeout de 10 segundos para login
      });

      if (!response.ok) {
        // 401 = credenciales inválidas, 400 = validación
        console.log(`❌ Login rechazado (status: ${response.status})`);
        this.logout();
        return false;
      }

      const data: AuthResponse = await response.json();

      if (!data.token) {
        console.log('❌ Respuesta de login sin token');
        this.logout();
        return false;
      }

      authToken.value = data.token;
      localStorage.setItem(TOKEN_KEY, data.token);

      currentUser.value = this.mapUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser.value));

      console.log('✅ Login exitoso:', currentUser.value);
      return true;
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    currentUser.value = null;
    authToken.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!(authToken.value || localStorage.getItem(TOKEN_KEY));
  }

  isInitializing(): boolean {
    return isInitializing.value;
  }

  // Esperar a que la inicialización termine
  async waitForInitialization(): Promise<void> {
    return new Promise((resolve) => {
      if (!isInitializing.value) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (!isInitializing.value) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10);
    });
  }

  getCurrentUser(): User | null {
    return currentUser.value;
  }

  getToken(): string | null {
    return authToken.value || localStorage.getItem(TOKEN_KEY);
  }

  getAuthHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  isAdmin(): boolean {
    return currentUser.value?.role === 'ADMIN';
  }

  // Computed getters para reactividad en Vue
  get user() {
    return currentUser;
  }

  get authenticated() {
    return authToken;
  }

  get initializing() {
    return isInitializing;
  }
}

export const authService = new AuthService();
