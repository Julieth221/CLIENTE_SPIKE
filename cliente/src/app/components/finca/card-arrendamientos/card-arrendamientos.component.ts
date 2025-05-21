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
import { VerArrendamientosComponent } from '../ver-arrendamientos/ver-arrendamientos.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EditarArrendamientosComponent } from '../editar-arrendamientos/editar-arrendamientos.component';
import { forkJoin } from 'rxjs';

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
    MatProgressSpinnerModule,
    MatDialogModule
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
    private authService: AuthService,
    private dialog: MatDialog
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
    this.loading = true;
    this.errorMessage = '';
    
    // Obtener arrendamientos activos para cada finca
    const observables = this.fincasUsuario.map(finca => 
      this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/activos/${finca.Id}/`)
    );
    
    forkJoin(observables).subscribe({
      next: (responses: any[]) => {
        console.log('Respuestas de arrendamientos activos:', responses);
        
        // Procesar todas las respuestas
        const arrendamientosActivos = new Set<number>();
        responses.forEach(response => {
          if (Array.isArray(response)) {
            response.forEach(arrendamiento => {
              if (arrendamiento.Id) {
                arrendamientosActivos.add(arrendamiento.Id);
              }
            });
          }
        });
        
        // Obtener todos los arrendamientos
        this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/`).subscribe({
          next: (response: any) => {
            if (Array.isArray(response)) {
              // Marcar los arrendamientos como activos o inactivos
              this.arrendamientosData = response.map(arrendamiento => ({
                ...arrendamiento,
                activo: arrendamientosActivos.has(arrendamiento.Id)
              }));
            } else {
              this.errorMessage = 'Formato de respuesta inválido';
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
      },
      error: (error: any) => {
        this.errorMessage = 'Error al obtener los arrendamientos activos';
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
    // Abrir el diálogo con los datos del arrendamiento
    this.dialog.open(VerArrendamientosComponent, {
      data: {
        arrendamientoId: arrendamiento.Id,
        nombreFinca: arrendamiento.Finca,
        fincaId:   arrendamiento.FincaID,

      },
      width: '50%',
      maxWidth: '1200px'
    });
  }

  //  abrir modal con MatDialog
  editarArrendamiento(arrendamiento: any): void {
    this.dialog.open(EditarArrendamientosComponent, {
      data: {
        arrendamientoId: arrendamiento.id,
        nombreFinca:     arrendamiento.finca.Nombre,
        fincaId:   arrendamiento.finca.Id,
      },
      width: '50%',
      maxWidth: '1200px',
      disableClose: true         
    }).afterClosed().subscribe((result) => {
      // Si el resultado indica que se actualizó el arrendamiento, recargamos los datos
      if (result && result.actualizado) {
        this.obtenerArrendamientos();
      }
    });
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
    return arrendamiento.activo;
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
