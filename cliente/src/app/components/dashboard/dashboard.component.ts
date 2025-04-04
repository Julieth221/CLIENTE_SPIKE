import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatListModule } from '@angular/material/list'; // Importa MatListModule

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
    MatListModule, // Agrega MatListModule a los imports
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  showFiller = false;

  /**
   * Función para navegar a un componente específico.
   * @param componentName Nombre del componente al que se quiere navegar.
   */
  goToComponent(componentName: string): void {
    console.log(`Navigating to ${componentName}`);
    // Aquí iría la lógica de navegación real, por ejemplo, usando el Router de Angular.
    // this.router.navigate([componentName]);
  }
}
