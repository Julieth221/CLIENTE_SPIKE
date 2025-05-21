import { Component, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; 
import { CommonModule, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CardArrendamientosComponent } from '../card-arrendamientos/card-arrendamientos.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../../services/auth.service';
import { VerArrendamientosComponent } from '../ver-arrendamientos/ver-arrendamientos.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarArrendamientosComponent } from '../editar-arrendamientos/editar-arrendamientos.component';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-tabla-arrendamientos',
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatRippleModule,
    MatButtonToggleModule,
    CardArrendamientosComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    // VerArrendamientosComponent,
    OverlayModule, 
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './tabla-arrendamientos.component.html',
  styleUrl: './tabla-arrendamientos.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TablaArrendamientosComponent implements OnInit, AfterViewInit {
  // Referencias para paginación y ordenamiento
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(VerArrendamientosComponent) verArrendamientosComponent!: VerArrendamientosComponent;
  @ViewChild(EditarArrendamientosComponent) EditarArrendamientosComponent!: EditarArrendamientosComponent;
  
  // Control de vista
  vistaActual: 'tabla' | 'tarjeta' = 'tabla';

  // Datos y filtrados
  arrendamientos: any[] = [];
  fincasUsuario: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  expandedElement: any | null = null;

  // Filtros
  searchText: string = '';
  filterEstado: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  filterFechaInicio: string = '';
  filterFechaFin: string = '';
  
  // Opciones para filtros
  estadoOptions: string[] = ['Activo', 'Inactivo'];
  
  // Estado
  loading: boolean = true;
  userId: number = 0;
  errorMessage: string = '';

  // Columnas para mostrar
  displayedColumns: string[] = ['finca', 'arrendatario', 'parcelas', 'fechaInicio', 'fechaFin', 'estado', 'acciones'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private datePipe: DatePipe,
    private authService: AuthService,
    private dialog: MatDialog  
  ) {}

  private isMobileView(): boolean {
    return window.innerWidth <= 768;
  }



  @HostListener('window:resize', ['$event'])
  onResize() {
    // Cambiar automáticamente a vista de tarjetas en móvil
    if (this.isMobileView()) {
      this.vistaActual = 'tarjeta';
    }
  }

  ngOnInit(): void {
    // Establecer vista inicial basada en el tamaño de la pantalla
    this.vistaActual = this.isMobileView() ? 'tarjeta' : 'tabla';
    
    // Obtener ID del usuario autenticado desde el token
    this.userId = this.authService.getIdFromToken();
    console.log('ID del usuario autenticado:', this.userId);
    
    // Obtener las fincas del usuario
    this.obtenerFincasUsuario();
  }

  ngAfterViewInit() {
    // Configurar paginación y ordenamiento después de que se inicialicen las vistas
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerFincasUsuario() {
    this.loading = true;
    this.errorMessage = '';
    
    // Consultar las fincas del usuario que inició sesión
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca`).subscribe({
      next: (response: any) => {
        console.log('Respuesta de fincas recibida:', response);
        
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
            this.dataSource.data = [];
          }
        } else {
          this.errorMessage = 'Formato de respuesta inválido: no se encontró el arreglo de fincas';
          console.error(this.errorMessage, response);
          this.loading = false;
          this.dataSource.data = [];
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
    
    // Primero obtener todos los arrendamientos
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          // Obtener los IDs únicos de las fincas que tienen arrendamientos
          const fincasConArrendamientos = new Set(
            response.map((arr: any) => arr.FincaID)
          );
          
          console.log('Fincas con arrendamientos:', Array.from(fincasConArrendamientos));

          // Consultar arrendamientos activos solo para las fincas que tienen arrendamientos
          const observables = Array.from(fincasConArrendamientos).map(fincaId => {
            console.log('Consultando arrendamientos activos para finca ID:', fincaId);
            return this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/activos/${fincaId}/`);
          });

          forkJoin(observables).subscribe({
            next: (responses: any[]) => {
              console.log('Respuestas de arrendamientos activos:', responses);
              
              // Procesar todas las respuestas
              const arrendamientosActivos = new Set<number>();
              responses.forEach((response, index) => {
                if (Array.isArray(response)) {
                  response.forEach(arrendamiento => {
                    if (arrendamiento && arrendamiento.Id) {
                      console.log('Arrendamiento activo encontrado:', arrendamiento);
                      arrendamientosActivos.add(arrendamiento.Id);
                    }
                  });
                }
              });

              // Marcar los arrendamientos como activos o inactivos
              this.arrendamientos = response.map(arrendamiento => {
                const esActivo = arrendamientosActivos.has(arrendamiento.Id);
                console.log(`Arrendamiento ${arrendamiento.Id} - Activo: ${esActivo}`);
                return {
                  ...arrendamiento,
                  activo: esActivo
                };
              });
              
              this.dataSource.data = this.arrendamientos;
              this.loading = false;
            },
            error: (error: any) => {
              this.errorMessage = 'Error al obtener los arrendamientos activos';
              console.error(this.errorMessage, error);
              this.loading = false;
            }
          });
        } else {
          this.errorMessage = 'Formato de respuesta inválido';
          console.error(this.errorMessage, response);
          this.loading = false;
          this.dataSource.data = [];
        }
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

  createFilterPredicate() {
    return (data: any, filter: string) => {
      const searchTerms = JSON.parse(filter);
      
      // Filtro por texto (nombre de la finca o arrendatario)
      const textoMatch = !searchTerms.searchText || 
        (data.arrendamiento?.Finca?.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
         data.arrendamiento?.Arrendatario?.toLowerCase().includes(searchTerms.searchText.toLowerCase()));
      
      // Filtro por estado
      const estadoMatch = !searchTerms.filterEstado || 
        (searchTerms.filterEstado === 'Activo' && data.activo) || 
        (searchTerms.filterEstado === 'Inactivo' && !data.activo);
      
      // Filtro por fecha de inicio
      const fechaInicioMatch = !searchTerms.filterFechaInicio || 
        (data.fechaInicio && this.formatDate(data.fechaInicio).includes(searchTerms.filterFechaInicio));
      
      // Filtro por fecha de fin
      const fechaFinMatch = !searchTerms.filterFechaFin || 
        (data.fechaFin && this.formatDate(data.fechaFin).includes(searchTerms.filterFechaFin));
      
      return textoMatch && estadoMatch && fechaInicioMatch && fechaFinMatch;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      filterEstado: this.filterEstado,
      filterFechaInicio: this.filterFechaInicio,
      filterFechaFin: this.filterFechaFin
    });
    
    this.dataSource.filter = filterValue;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  registrarArrendamiento() {
    this.router.navigate(['/dashboard/finca/arrendamiento']);
  }

    //  abrir modal con MatDialog
    verArrendamiento(arrendamiento: any): void {
      this.dialog.open(VerArrendamientosComponent, {
        data: {
          arrendamientoId: arrendamiento.Id,
          nombreFinca:     arrendamiento.Finca,
          fincaId:   arrendamiento.FincaID,
        },
        width: '50%',
        maxWidth: '1200px',
        disableClose: true         
      }).afterClosed().subscribe(() => {
        
      });
    }

    //  abrir modal con MatDialog
    editarArrendamiento(arrendamiento: any): void {
      this.dialog.open(EditarArrendamientosComponent, {
        data: {
          arrendamientoId: arrendamiento.id,
          nombreFinca:     arrendamiento.Finca,
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
    if (confirm(`¿Está seguro de eliminar el arrendamiento de la finca "${arrendamiento.arrendamiento.Finca}"?`)) {
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${arrendamiento.id}`).subscribe({
        next: () => {
          this.obtenerArrendamientos();
        },
        error: (error) => {
          console.error('Error al eliminar el arrendamiento:', error);
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
    if (!arrendamiento) return false;
    
    // Verificar si el arrendamiento tiene la propiedad activo
    if (arrendamiento.activo !== undefined) {
      return arrendamiento.activo;
    }
    
    // Si no tiene la propiedad activo, verificar las fechas
    const ahora = new Date();
    const fechaInicio = new Date(arrendamiento.FechaInicio);
    const fechaFin = new Date(arrendamiento.FechaFin);
    
    return arrendamiento.Activo && 
           ahora >= fechaInicio && 
           ahora <= fechaFin;
  }
}