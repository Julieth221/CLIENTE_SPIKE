import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { AuthService } from '../../../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-card-arrendamientos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  providers: [DatePipe],
  templateUrl: './card-arrendamientos.component.html',
  styleUrl: './card-arrendamientos.component.css'
})
export class CardArrendamientosComponent implements OnInit {
  @Input() arrendamientos: any[] = [];
  
  // Estado
  loading: boolean = false;
  errorMessage: string = '';
  userId: number = 0;
  arrendamientosData: any[] = [];
  fincasUsuario: any[] = [];
  
  constructor(
    private router: Router,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Si no recibimos arrendamientos como input, los cargamos directamente
    if (this.arrendamientos.length === 0) {
      // this.userId = this.authService.getIdFromToken();
      this.obtenerFincasUsuario();
    } else {
      this.arrendamientosData = this.arrendamientos;
    }
  }

  obtenerFincasUsuario() {
    this.loading = true;
    this.errorMessage = '';
    
    // Consultar las fincas del usuario que inició sesión
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca`).subscribe({
      next: (response: any) => {
        console.log('Respuesta de fincas recibida:', response);
        
        // Verificar que la respuesta contiene la propiedad Data y es un array
        if (response && response.Data && Array.isArray(response.Data)) {
          // Filtrar solo las fincas que pertenecen al usuario actual
          this.fincasUsuario = response.Data.filter((finca: any) => finca.Id_Usuario === this.userId);
          console.log('Fincas del usuario:', this.fincasUsuario);
          
          if (this.fincasUsuario.length > 0) {
            // Si el usuario tiene fincas, obtener sus arrendamientos
            this.obtenerArrendamientos();
          } else {
            console.log('El usuario no tiene fincas registradas');
            this.loading = false;
            this.arrendamientosData = [];
          }
        } else {
          this.errorMessage = 'Formato de respuesta inválido: no se encontró el arreglo de fincas';
          console.error(this.errorMessage, response);
          this.loading = false;
          this.arrendamientosData = [];
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Error al obtener las fincas';
        console.error(this.errorMessage, error);
        this.loading = false;
      }
    });
  }

  obtenerArrendamientos() {
    // Consultar todos los arrendamientos
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento`).subscribe({
      next: (response: any) => {
        console.log('Arrendamientos obtenidos:', response);
        
        // Verificar que la respuesta contiene la propiedad Data y es un array
        if (response && response.Data && Array.isArray(response.Data)) {
          // Filtrar solo los arrendamientos relacionados con las fincas del usuario
          const fincasIds = this.fincasUsuario.map(finca => finca.Id);
          
          let arrendamientosFiltrados = response.Data.filter((arrendamiento: any) => {
            return arrendamiento.FkArrendamientoFinca && 
                   fincasIds.includes(arrendamiento.FkArrendamientoFinca.Id);
          });
          
          console.log('Arrendamientos filtrados:', arrendamientosFiltrados);
          
          // Procesar los arrendamientos para agruparlos por finca y arrendatario
          this.arrendamientosData = this.procesarArrendamientos(arrendamientosFiltrados);
        } else {
          this.errorMessage = 'Formato de respuesta inválido: no se encontró el arreglo de arrendamientos';
          console.error(this.errorMessage, response);
          this.arrendamientosData = [];
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al obtener los arrendamientos';
        console.error(this.errorMessage, error);
        this.loading = false;
      }
    });
  }

  procesarArrendamientos(arrendamientos: any[]): any[] {
    // Agrupar arrendamientos por finca y arrendatario
    const arrendamientosAgrupados = new Map();
    
    arrendamientos.forEach(arrendamiento => {
      const fincaId = arrendamiento.FkArrendamientoFinca.Id;
      const arrendatarioId = arrendamiento.IdUserUserArrendatario?.Id || 'sin-arrendatario';
      
      const key = `${fincaId}-${arrendatarioId}`;
      
      if (!arrendamientosAgrupados.has(key)) {
        arrendamientosAgrupados.set(key, {
          id: arrendamiento.Id,
          finca: arrendamiento.FkArrendamientoFinca,
          arrendatario: arrendamiento.IdUserUserArrendatario,
          fechaInicio: new Date(arrendamiento.FechaInicio),
          fechaFin: new Date(arrendamiento.FechaFin),
          activo: arrendamiento.Activo,
          valor: arrendamiento.Valor,
          parcelas: [],
        });
      }
      
      // Agregar la parcela al grupo
      if (arrendamiento.FkArrendatamientoParcela) {
        arrendamientosAgrupados.get(key).parcelas.push(arrendamiento.FkArrendatamientoParcela);
      }
    });
    
    // Convertir el Map a un array
    return Array.from(arrendamientosAgrupados.values());
  }

  verArrendamiento(arrendamiento: any) {
    this.router.navigate(['/dashboard/arrendamiento/ver', arrendamiento.id]);
  }

  editarArrendamiento(arrendamiento: any) {
    this.router.navigate(['/dashboard/arrendamiento/editar', arrendamiento.id]);
  }

  eliminarArrendamiento(arrendamiento: any) {
    if (confirm(`¿Está seguro de eliminar el arrendamiento de la finca "${arrendamiento.finca.Nombre}"?`)) {
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${arrendamiento.id}`).subscribe({
        next: () => {
          // Si estamos cargando los datos directamente, refrescar la lista
          if (this.arrendamientos.length === 0) {
            this.obtenerArrendamientos();
          } else {
            // Si recibimos los arrendamientos como input, recargar toda la página
            window.location.reload();
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el arrendamiento';
          console.error(this.errorMessage, error);
        }
      });
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString();
  }

  estaActivo(arrendamiento: any): boolean {
    const ahora = new Date();
    return arrendamiento.activo && 
           ahora >= arrendamiento.fechaInicio && 
           ahora <= arrendamiento.fechaFin;
  }

  getEstadoColor(arrendamiento: any): string {
    return this.estaActivo(arrendamiento) ? '#28C76F' : '#EA5455';
  }

  getEstadoTexto(arrendamiento: any): string {
    return this.estaActivo(arrendamiento) ? 'Activo' : 'Inactivo';
  }
  
  reintentar() {
    this.obtenerFincasUsuario();
  }
}
