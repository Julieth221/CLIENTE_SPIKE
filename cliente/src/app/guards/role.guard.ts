import { inject } from '@angular/core';
import { Router, CanActivateFn, CanDeactivateFn } from '@angular/router';

const getUserRole = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.role || null;
  } catch {
    return null;
  }
};

const checkAdminRole = (): boolean => {
  const role = getUserRole();
  return role === 'ADMIN';
};

const checkPropietarioRole = (rolesPermitidos: string[]): boolean => {
  const role = getUserRole();
  return rolesPermitidos?.includes('PROPIETARIO') && role === 'PROPIETARIO';
};

const checkArrendatarioRole = (rolesPermitidos: string[]): boolean => {
  const role = getUserRole();
  return rolesPermitidos?.includes('ARRENDATARIO') && role === 'ARRENDATARIO';
};

export const AdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = getUserRole();
  
  if (!role || role !== 'ADMIN') {
    router.navigate(['/no-autorizado']);
    return false;
  }
  return true;
};

export const PropietarioGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = getUserRole();
  const rolesPermitidos = route.data['roles'] as string[];
  
  if (!role || !rolesPermitidos?.includes(role)) {
    router.navigate(['/no-autorizado']);
    return false;
  }
  return true;
};

export const ArrendatarioGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = getUserRole();
  const rolesPermitidos = route.data['roles'] as string[];
  
  if (!role || !rolesPermitidos?.includes(role)) {
    router.navigate(['/no-autorizado']);
    return false;
  }
  return true;
};

// Guard para desactivación de rutas
export const canDeactivateGuard: CanDeactivateFn<any> = () => {
  return true; // Siempre permite la desactivación
}; 