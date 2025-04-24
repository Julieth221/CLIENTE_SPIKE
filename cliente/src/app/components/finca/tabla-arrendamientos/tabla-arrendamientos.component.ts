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
          this.arrendamientos = this.procesarArrendamientos(arrendamientosFiltrados);
          this.dataSource.data = this.arrendamientos;
          
          // Configurar el filtro personalizado
          this.dataSource.filterPredicate = this.createFilterPredicate();
        } else {
          this.errorMessage = 'Formato de respuesta inválido: no se encontró el arreglo de arrendamientos';
          console.error(this.errorMessage, response);
          this.dataSource.data = [];
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

  createFilterPredicate() {
    return (data: any, filter: string) => {
      const searchTerms = JSON.parse(filter);
      
      // Filtro por texto (nombre de la finca o arrendatario)
      const textoMatch = !searchTerms.searchText || 
        (data.finca?.Nombre?.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
         data.arrendatario?.Nombre?.toLowerCase().includes(searchTerms.searchText.toLowerCase()));
      
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
          arrendamientoId: arrendamiento.id,
          nombreFinca:     arrendamiento.finca.Nombre,
          fincaId:   arrendamiento.finca.Id
        },
        width: '50%',
        maxWidth: '1200px',
        disableClose: true         
      }).afterClosed().subscribe(() => {
        
      });
    }
  

  editarArrendamiento(arrendamiento: any) {
    this.router.navigate(['/dashboard/arrendamiento/editar', arrendamiento.id]);
  }

  eliminarArrendamiento(arrendamiento: any) {
    if (confirm(`¿Está seguro de eliminar el arrendamiento de la finca "${arrendamiento.finca.Nombre}"?`)) {
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
    const ahora = new Date();
    return arrendamiento.activo && 
           ahora >= arrendamiento.fechaInicio && 
           ahora <= arrendamiento.fechaFin;
  }
}