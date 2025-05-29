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
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(VerArrendamientosComponent) verArrendamientosComponent!: VerArrendamientosComponent;
  @ViewChild(EditarArrendamientosComponent) EditarArrendamientosComponent!: EditarArrendamientosComponent;
  
  // Control de vista
  vistaActual: 'tabla' | 'tarjeta' = 'tabla';
  fincaSeleccionada: number | null = null;
  fincasUsuario: any[] = [];
  
  // Datos y filtrados
  parcelasArrendadas: any[] = [];
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
  loading: boolean = false;
  userId: number = 0;
  errorMessage: string = '';

  // Columnas para mostrar
  displayedColumns: string[] = [
    'parcelas',
    'arrendatario',
    'fechaInicio',
    'fechaFin',
    'valorTotal',
    'estado',
    'acciones'
  ];

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
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca?query=Id_Usuario:${this.userId}`).subscribe({
      next: (response: any) => {
        if (response && response.Data && Array.isArray(response.Data)) {
          this.fincasUsuario = response.Data;
          this.loading = false;
        } else {
          this.errorMessage = 'No se pudieron cargar las fincas';
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las fincas';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  onFincaChange(fincaId: number) {
    if (!fincaId) {
      this.dataSource.data = [];
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/arrendamiento/parcelas/porfinca/${fincaId}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.parcelasArrendadas = response;
          this.dataSource.data = response;
        } else {
          this.errorMessage = 'Formato de respuesta inválido';
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las parcelas arrendadas';
        console.error('Error:', error);
        this.loading = false;
        this.dataSource.data = [];
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  formatCurrency(value: number): string {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }

  registrarArrendamiento() {
    this.router.navigate(['/dashboard/finca/arrendamiento']);
  }

  verArrendamiento(arrendamiento: any): void {
    console.log('Datos del arrendamiento:', arrendamiento);
    this.router.navigate(['/dashboard/finca/arrendamientodetalle'], {
      state: {
        arrendamientoId: arrendamiento.IdArrendamiento,
        nombreFinca: this.fincasUsuario.find(f => f.Id === this.fincaSeleccionada)?.Nombre,
        fincaId: this.fincaSeleccionada
      }
    });
  }

  editarArrendamiento(arrendamiento: any): void {
    console.log('Datos del arrendamiento:', arrendamiento);
    this.router.navigate(['/dashboard/finca/editararrendamiento'], {
      state: {
        arrendamientoId: arrendamiento.IdArrendamiento,
        arrendatarioId: arrendamiento.IdArrendatario,
        fincaId: this.fincaSeleccionada,
        estadoArrendamiento: arrendamiento.Estado,

      }
    });
  }

  eliminarArrendamiento(arrendamiento: any) {
    if (confirm(`¿Está seguro de eliminar el arrendamiento de las parcelas "${arrendamiento.Parcelas}"?`)) {
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${arrendamiento.IdArrendamiento}`).subscribe({
        next: () => {
          this.onFincaChange(this.fincaSeleccionada!);
        },
        error: (error) => {
          console.error('Error al eliminar el arrendamiento:', error);
          this.errorMessage = 'Error al eliminar el arrendamiento';
        }
      });
    }
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

  applyFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      const searchText = this.searchText.toLowerCase();
      const estadoMatch = !this.filterEstado || data.Estado === this.filterEstado;
      const textMatch = !searchText || 
        data.NombreParcela.toLowerCase().includes(searchText) ||
        (data.Arrendatario && data.Arrendatario.toLowerCase().includes(searchText));
      
      let fechaMatch = true;
      if (this.fechaInicio) {
        const fechaInicio = new Date(data.FechaInicio);
        fechaMatch = fechaMatch && fechaInicio >= this.fechaInicio;
      }
      if (this.fechaFin) {
        const fechaFin = new Date(data.FechaFin);
        fechaMatch = fechaMatch && fechaFin <= this.fechaFin;
      }
      
      return estadoMatch && textMatch && fechaMatch;
    };
    
    this.dataSource.filter = 'trigger';
  }
}