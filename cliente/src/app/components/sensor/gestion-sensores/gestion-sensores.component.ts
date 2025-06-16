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
import { AuthService } from '../../../../services/auth.service';
<<<<<<< HEAD
=======

interface RegistroCultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  AreaSembrada: number;
  Activo: boolean;
}
>>>>>>> e007e02f22d070acd6ab3b7242a8e3b0c7f721aa

interface SensorData {
  id: number;
  ID: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  TipoSensor: string;
  Estado: string;
  FechaInstalacion: string;
  nombre_sensor: string;
  tipo_sensor: string;
  estado: string;
  fechaRegistro: string;
  fecha_instalacion: string;
  ubicacionSensor: {
    lat: number;
    lng: number;
  };
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
    CardSensorComponent,
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
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  vistaActual: 'tabla' | 'tarjeta' = 'tabla';
<<<<<<< HEAD
  sensoresUsuarios: any [] = [];

  // Datos y filtrados
  sensores: SensorData[] = [
    { id: 1, nombre: 'Sensor PH Norte', ubicacion: 'Invernadero 1', latitud: 10.123, longitud: -75.456, cultivo: 'Tomate', fechaRegistro: '2024-05-01', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-04-20', ID: 101 },
    { id: 2, nombre: 'Sensor Humedad Sur', ubicacion: 'Campo Abierto A', latitud: 9.876, longitud: -75.987, cultivo: 'Maíz', fechaRegistro: '2024-05-05', TipoSensor: 'Humedad', Estado: 'Inactivo', FechaInstalacion: '2024-04-25', ID: 102 },
    { id: 3, nombre: 'Sensor Temp Este', ubicacion: 'Invernadero 2', latitud: 10.567, longitud: -75.123, cultivo: 'Pimentón', fechaRegistro: '2024-05-10', TipoSensor: 'Temperatura', Estado: 'Activo', FechaInstalacion: '2024-05-01', ID: 103 },
    { id: 4, nombre: 'Sensor PH Oeste', ubicacion: 'Campo Abierto B', latitud: 9.543, longitud: -76.234, cultivo: 'Yuca', fechaRegistro: '2024-05-15', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-05-05', ID: 104 },
    { id: 5, nombre: 'Sensor Luz Central', ubicacion: 'Invernadero 1', latitud: 10.345, longitud: -75.678, cultivo: 'Tomate', fechaRegistro: '2024-05-20', TipoSensor: 'Luz', Estado: 'Resuelto', FechaInstalacion: '2024-05-10', ID: 105 },
    { id: 6, nombre: 'Sensor Humedad Norte', ubicacion: 'Campo Abierto A', latitud: 9.765, longitud: -76.012, cultivo: 'Maíz', fechaRegistro: '2024-05-25', TipoSensor: 'Humedad', Estado: 'Activo', FechaInstalacion: '2024-05-15', ID: 106 },
  ];
  dataSource = new MatTableDataSource<SensorData>(this.sensores);
=======
  sensores: SensorData[] = [];
  dataSource = new MatTableDataSource<SensorData>([]);
>>>>>>> e007e02f22d070acd6ab3b7242a8e3b0c7f721aa
  expandedElement: any | null = null;

  searchText: string = '';
  filterTSensor: string = '';
  tipoSensorOptions: string[] = [];
  loading: boolean = false;
  userId: number = 0;
  errorMessage: string = '';

  displayedColumns: string[] = ['nombre', 'tipo sensor', 'fecha instalacion', 'Estado', 'acciones'];

  // Nuevas propiedades para cultivos
  cultivos: RegistroCultivo[] = [];
  cultivoSeleccionado: number | null = null;
  user_id: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
<<<<<<< HEAD
    private authService: AuthService,
  ) { }
=======
    private authService: AuthService
  ) {}
>>>>>>> e007e02f22d070acd6ab3b7242a8e3b0c7f721aa

  private isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isMobileView()) {
      this.vistaActual = 'tarjeta';
    }
  }

  ngOnInit(): void {
    this.vistaActual = this.isMobileView() ? 'tarjeta' : 'tabla';
<<<<<<< HEAD
    this.obtenerSensores(); // Aseguramos que se llama para inicializar el dataSource y el filtro
    this.obtenerTipoSensorOptions();

        // Obtener ID del usuario autenticado desde el token
    this.userId = this.authService.getIdFromToken();
    console.log('ID del usuario autenticado:', this.userId);
=======
    this.user_id = this.authService.getUserId();
    if (this.user_id) {
      this.cargarCultivos();
    }
>>>>>>> e007e02f22d070acd6ab3b7242a8e3b0c7f721aa
  }

  cargarCultivos(): void {
    this.loading = true;
    this.apiService.get<RegistroCultivo[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.cultivos = response.Data.filter((cultivo: RegistroCultivo) => cultivo.Activo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.loading = false;
      }
    });
  }

  onCultivoSeleccionado(cultivoId: number): void {
    this.cultivoSeleccionado = cultivoId;
    this.cargarSensoresPorCultivo(cultivoId);
  }

  cargarSensoresPorCultivo(cultivoId: number): void {
    this.loading = true;
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/sensores/sensoresPorCultivo/${cultivoId}`).subscribe({
      next: (response: any) => {
        // Mapear la respuesta del API al formato esperado por la tabla
        this.sensores = response.data.map((sensor: any) => ({
          id: sensor.id || sensor.ID,
          ID: sensor.ID || sensor.id,
          nombre: sensor.nombre_sensor || sensor.nombre,
          ubicacion: sensor.ubicacion || '',
          latitud: sensor.ubicacionSensor?.lat || 0,
          longitud: sensor.ubicacionSensor?.lng || 0,
          cultivo: sensor.cultivo || '',
          TipoSensor: sensor.tipo_sensor || 'No especificado',
          Estado: sensor.estado || 'No especificado',
          FechaInstalacion: sensor.fecha_instalacion || '',
          ubicacionSensor: {
            lat: sensor.ubicacionSensor?.lat || 0,
            lng: sensor.ubicacionSensor?.lng || 0
          }
        }));
        
        this.dataSource.data = this.sensores;
        // Actualizar las opciones de tipo de sensor, excluyendo los vacíos
        this.tipoSensorOptions = [...new Set(this.sensores
          .map(s => s.TipoSensor)
          .filter(tipo => tipo && tipo !== 'No especificado'))]
          .sort();
        
        this.dataSource.filterPredicate = this.createFilterPredicate();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar sensores:', error);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createFilterPredicate() {
    return (data: SensorData, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const nombreMatch = data.nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase());
      const tipoMatch = !searchTerms.filterTSensor || data.TipoSensor === searchTerms.filterTSensor;
      return nombreMatch && tipoMatch;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      filterTSensor: this.filterTSensor
    });
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  registrarSensor() {
    this.router.navigate(['/dashboard/sensor/registro-t-sensor']);
  }

  editarSensor(sensor: SensorData) {
    this.router.navigate(['/sensor/editar', sensor.ID]);
  }

  eliminarSensor(sensor: SensorData) {
    if (confirm(`¿Está seguro de eliminar el sensor "${sensor.nombre}"?`)) {
      this.apiService.delete(`${API_URLS.MID.API_MID_SPIKE}/sensores/${sensor.ID}`).subscribe({
        next: () => {
          this.cargarSensoresPorCultivo(this.cultivoSeleccionado!);
        },
        error: (error) => {
          console.error('Error al eliminar el sensor:', error);
        }
      });
    }
  }

  // Métodos para manejar eventos emitidos por CardSensorComponent
  onVerSensor(sensor: SensorData): void {
    this.verSensor(sensor);
  }

    obtenerFincasUsuario() {
      this.loading = true;
      this.errorMessage = '';
      
      this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo?query=fk_cultivo:${this.userId}`).subscribe({
        next: (response: any) => {
          if (response && response.Data && Array.isArray(response.Data)) {
            this.sensoresUsuarios = response.Data;
            this.loading = false;
          } else {
            this.errorMessage = 'No se pudieron cargar los cultivos';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar los cultivos';
          console.error('Error:', error);
          this.loading = false;
        }
      });
    }

  onEditarSensor(sensor: SensorData): void {
    this.editarSensor(sensor);
  }

  onEliminarSensor(sensor: SensorData): void {
    this.eliminarSensor(sensor);
  }

  verSensor(sensor: SensorData): void {
    this.dialog.open(VersensorComponent, {
      data: {
        sensorId: sensor.id,
        nombreSensor: sensor.nombre,
        FechaInstalacion: sensor.FechaInstalacion
      },
      width: '50%',
      maxWidth: '1200px',
      disableClose: true
    }).afterClosed().subscribe(() => {
    });
  }
}
