import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';

@Component({
  selector: 'app-card-fincas',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './card-fincas.component.html',
  styleUrl: './card-fincas.component.css'
})
export class CardFincasComponent implements OnInit {
  @Input() fincas: any[] = [];
  
  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void { }

  editarFinca(finca: any) {
    this.router.navigate(['/finca/editar', finca.ID]);
  }
  verFinca(finca: any) {
    this.router.navigate(['/finca/editar', finca.ID]);
  }

  eliminarFinca(finca: any) {
    if (confirm(`¿Está seguro de eliminar la finca "${finca.Nombre}"?`)) {
      this.apiService.delete(`${API_URLS.MID.API_MID_SPIKE}/finca/${finca.ID}`).subscribe({
        next: () => {
          // Emitir evento para refrescar la lista de fincas
          window.location.reload();
        },
        error: (error) => {
          console.error('Error al eliminar la finca:', error);
        }
      });
    }
  }

  getTipoSueloColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'Limoso': '#8bc34a',  // Verde
      'Arcilloso': '#ff9800', // Naranja
      'Arenoso': '#ffc107',  // Amarillo
      'Humífero': '#795548', // Marrón
      'Calcáreo': '#e0e0e0', // Gris claro
      'Aluvial': '#03a9f4'   // Azul claro
    };
    
    return colors[tipo] || '#9e9e9e'; // Gris por defecto
  }

  getTypeIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'Limoso': 'terrain',
      'Arcilloso': 'waves',
      'Arenoso': 'grain',
      'Humífero': 'compost',
      'Calcáreo': 'landscape',
      'Aluvial': 'water'
    };
    
    return icons[tipo] || 'public';
  }
}
