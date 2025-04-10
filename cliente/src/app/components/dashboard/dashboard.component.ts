import { Component, ChangeDetectionStrategy, Inject, ViewChild, AfterViewInit, ChangeDetectorRef  } from '@angular/core';
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
export class DashboardComponent  {
  isSidenavOpened = true;
  activeSubMenu: string | null = null;

  // Para controlar el estado del sidebar (abierto o cerrado)

  // Usuario actual, puedes modificar esto según de dónde obtienes los datos
  currentUser: any = {
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'Propietario'
  };

  sectionVisibility = {
    finca: false,
    cultivo: false,
    sensores: false
  };

  constructor(private router: Router) {}



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