import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URLS } from '../config/api_config';

interface TokenPayload {
  sub: string;
  user_id?: number;
  id?: number;
  iat: number;
  exp: number;
  // Otros campos que pueda tener tu token
}

interface UserInfo {
  role: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

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
  
  getIdFromToken(): number {
    const token = this.getToken();
    if (!token) return 0;
    
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      // Intenta obtener el ID del usuario desde varios posibles campos
      return decoded.id || decoded.user_id || 0;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return 0;
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

  getUserInfo(): UserInfo | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        role: payload.role,
        numeroDocumento: payload.numeroDocumento,
        nombre: payload.nombre,
        apellido: payload.apellido
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
} 