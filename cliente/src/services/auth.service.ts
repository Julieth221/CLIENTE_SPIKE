import { Injectable } from '@angular/core';
import { jwtDecode }from 'jwt-decode';


interface TokenPayload {
  sub: string;
  user_id?: number;
  iat: number;
  exp: number;
  // Otros campos que pueda tener tu token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      // Asumiendo que el ID del usuario está en la propiedad 'id_usuario' del token
      // Ajusta según la estructura real de tu token
      return decoded.user_id || null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
} 