import { Component, ChangeDetectionStrategy, Inject, ViewChild, AfterViewInit, ChangeDetectorRef, OnInit  } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule  } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { API_URLS } from '../../../config/api_config';
import { AuthService } from '../../../services/auth.service';

interface Usuario {
  Id: number;
  Nombre: string;
  Apellido: string;
  Contacto: string;
  CorreoElectronico: string;
  Activo: boolean;
}

interface RolUsuario {
  Id: number;
  FkUsuarioRoles: Usuario;
  FkRolesUsuario: {
    Id: number;
    Nombre: string;
    Activo: boolean;
  };
  Activo: boolean;
}

@Component({
  selector: 'app-dashboard',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatExpansionModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatMenuModule, 
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  isSidenavOpened = true;
  activeSubMenu: string | null = null;

  // Para controlar el estado del sidebar (abierto o cerrado)

  // Usuario actual, puedes modificar esto según de dónde obtienes los datos
  currentUser: any = {
    nombre: '',
    apellido: '',
    rol: ''
  };

  sectionVisibility = {
    finca: false,
    cultivo: false,
    sensores: false
  };

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
  }

  obtenerDatosUsuario() {
    const userId = this.authService.getIdFromToken();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    // Obtener datos del usuario
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario/${userId}`).subscribe({
      next: (response: any) => {
        if (response.Success && response.Data) {
          const usuario = response.Data;
          this.currentUser.nombre = usuario.Nombre;
          this.currentUser.apellido = usuario.Apellido;

          // Obtener el rol del usuario
          this.apiService.get(`${API_URLS.CRUD.API_CRUD_USUARIO}/Roles_Usuario?query=FkUsuarioRoles.Id:${userId},Activo:true`).subscribe({
            next: (rolesResponse: any) => {
              if (rolesResponse.Success && rolesResponse.Data && rolesResponse.Data.length > 0) {
                this.currentUser.rol = rolesResponse.Data[0].FkRolesUsuario.Nombre;
              }
            },
            error: (error) => {
              console.error('Error al obtener el rol del usuario:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    });
  }

  toggleSection(section: 'finca' | 'cultivo' | 'sensores') {
    this.sectionVisibility[section] = !this.sectionVisibility[section];
  }

  // Alternar visibilidad del submenú
  toggleSubMenu(menu: string) {
    this.activeSubMenu = this.activeSubMenu === menu ? null : menu;
  }
  // this.cdRef.markForCheck(); // Forzar verificación de cambios
  

  // Método para cerrar sesión
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // Método para alternar el sidebar
  toggleSidenav() {
    this.isSidenavOpened = !this.isSidenavOpened;
  }
}