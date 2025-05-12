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
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardSensorComponent } from '../card-sensor/card-sensor.component';
import { VersensorComponent } from '../versensor/versensor.component';

interface SensorData {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-gestion-sensores',
  standalone: true,
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
    MatDialogModule,
  ],
  templateUrl: './gestion-sensores.component.html',
  styleUrl: './gestion-sensores.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
})

export class GestionSensoresComponent implements OnInit, AfterViewInit {
  // Referencias para paginación y ordenamiento
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Control de vista
  vistaActual: 'tabla' | 'tarjeta' = 'tabla';
  // Datos y filtrados
  sensores: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  expandedElement: any | null = null;
  // Filtros
  searchText: string = '';
  // filterParcela: string = '';
  filterTSensor: string = '';
  // Opciones para filtros
  // parcelaOptions: number[] = [];
  tipoSensorOptions: string[] = [];
  // Estado
  loading: boolean = true;

  // Columnas para mostrar
  displayedColumns: string[] = ['nombre', 'ubicacion', 'tipo sensor','fecha instalacion', 'acciones'];



  constructor(
    private apiService: ApiService,
    private router: Router,
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
    this.obtenerSensores();
  }
  
  obtenerTipoSensorOptions() {
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/sensores/tipos`).subscribe({
      next: (response: any) => {
        this.tipoSensorOptions = response;
      },
      error: (error) => {
        console.error('Error al obtener opciones de tipo de sensor:', error);
      }
    });
  }
  
  ngAfterViewInit() {
    // Configurar paginación y ordenamiento después de que se inicialicen las vistas
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerSensores() {
    this.loading = true;
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/sensores/`).subscribe({
      next: (response: any) => {
        this.sensores = response;
        this.dataSource.data = this.sensores;
        // Obtener opciones únicas para los filtros
        // this.parcelaOptions = [...new Set(this.sensores.map(f => f.TotalParcelas))].sort((a, b) => a - b);
        this.tipoSensorOptions = [...new Set(this.sensores.map(f => f.TipoSensor))].sort((a, b) => a - b)
        // Configurar el filtro personalizado
        this.dataSource.filterPredicate = this.createFilterPredicate();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener los sensores:', error);
        this.loading = false;
      }
    });
  }

  createFilterPredicate() {
    return (data: any, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const nombreMatch = data.Nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase());
      // const parcelaMatch = !searchTerms.filterParcela || data.TotalParcelas === +searchTerms.filterParcela;
      const sensorMatch = !searchTerms.filterTSensor || data.TipoSensor === searchTerms.filterTSensor;
        return nombreMatch && sensorMatch//&& parcelaMatch  ;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      // filterParcela: this.filterParcela,
      filterSuelo: this.filterTSensor
    });
      this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  registrarSensor() {
    this.router.navigate(['/dashboard/register-sensor']);
  }

  editarSensor(sensores: any) {
    this.router.navigate(['/sensor/editar', sensores.ID]);
  }
  verSensor(sensores: any): void {
    this.dialog.open(VersensorComponent, {
        data: {
          sensorId: sensores.Id,
          nombreSensor: sensores.NombreSensor,
          FechaInstalacion: sensores.FechaInstalacion
        },
        width: '50%',
        maxWidth: '1200px',
        disableClose: true
    }).afterClosed().subscribe(() => {
      });
  }
  eliminarSensor(sensores: any) {
    if (confirm(`¿Está seguro de eliminar el sensor "${sensores.Nombre}"?`)) {
      this.apiService.delete(`${API_URLS.MID.API_MID_SPIKE}/sensores/${sensores.ID}`).subscribe({
        next: () => {
          this.obtenerSensores();
        },
        error: (error) => {
          console.error('Error al eliminar el sensor:', error);
        }
      });
    }
  }
}