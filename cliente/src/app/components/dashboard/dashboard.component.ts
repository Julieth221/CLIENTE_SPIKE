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

  // Ir a un componente mediante rutas dinámicas
  goToComponent(path: string) {
    const segments = path.split('/');
    console.log('Navegando a:', segments);
    this.router.navigate(['/dashboard',  ...segments]);
    
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

 
  // showFiller = false;
  // isSidenavCollapsed = false;
  // @ViewChild('sidenav') sidenav!: MatSidenav; // Usamos la aserción definitiva

  // constructor(
  //   private router: Router,
  //   private dialog: MatDialog, // Inyecta MatDialog
  // ) { }

  // ngAfterViewInit() {
  //    // Inicializa el sidenav aquí, dentro del ciclo de vida apropiado.
  //    // Ejemplo:
  //    if (this.sidenav) {
  //      //  this.sidenav.mode = 'side'; // Puedes configurar propiedades del sidenav aquí
  //    }
  // }

  // /**
  //  * Función para navegar a un componente específico.
  //  * @param componentName Nombre del componente al que se quiere navegar.
  //  */
  // goToComponent(componentName: string): void {
  //   console.log(`Navigating to ${componentName}`);
  //   // Aquí iría la lógica de navegación real, por ejemplo, usando el Router de Angular.
  //   // this.router.navigate([componentName]);
  // }

  // /**
  //  * Función para cerrar sesión.
  //  */
  // logout(): void {
  //   const dialogRef = this.dialog.open(ConfirmationDialog, {
  //     width: '300px',
  //     data: { title: 'Cerrar Sesión', message: '¿Está seguro de que desea cerrar sesión?' } // Pasa título y mensaje al diálogo
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       console.log('Cerrando sesión...');
  //       this.router.navigate(['/login']);
  //     }
  //   });
  // }

  // toggleSidenav(): void {
  //   this.isSidenavCollapsed = !this.isSidenavCollapsed;
  //   this.sidenav.toggle();
  // }
}

// @Component({
//   selector: 'confirmation-dialog',
//   template: `
//     <h2 mat-dialog-title>{{data.title}}</h2>
//     <mat-dialog-content>
//       <p>{{data.message}}</p>
//     </mat-dialog-content>
//     <mat-dialog-actions align="end">
//       <button mat-button mat-dialog-cancel>Cancelar</button>
//       <button mat-button [mat-dialog-close]="true">Cerrar Sesión</button>
//     </mat-dialog-actions>
//   `,
//   standalone: true,
//   imports: [MatButtonModule, MatDialogModule]
// })
// export class ConfirmationDialog {
//   constructor(
//     public dialogRef: MatDialogRef<ConfirmationDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
//   ) { }
// }

