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
import { CardSensorComponent } from '../card-sensor/card-sensor.component'; // Importa CardSensorComponent
import { VersensorComponent } from '../versensor/versensor.component';

interface SensorData {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  fechaRegistro: string;
  TipoSensor: string;
  Estado: string;
  FechaInstalacion: string;
  ID: number;
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
    CardSensorComponent, // Añade CardSensorComponent aquí
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
  sensores: SensorData[] = [
    { id: 1, nombre: 'Sensor PH Norte', ubicacion: 'Invernadero 1', latitud: 10.123, longitud: -75.456, cultivo: 'Tomate', fechaRegistro: '2024-05-01', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-04-20', ID: 101 },
    { id: 2, nombre: 'Sensor Humedad Sur', ubicacion: 'Campo Abierto A', latitud: 9.876, longitud: -75.987, cultivo: 'Maíz', fechaRegistro: '2024-05-05', TipoSensor: 'Humedad', Estado: 'Inactivo', FechaInstalacion: '2024-04-25', ID: 102 },
    { id: 3, nombre: 'Sensor Temp Este', ubicacion: 'Invernadero 2', latitud: 10.567, longitud: -75.123, cultivo: 'Pimentón', fechaRegistro: '2024-05-10', TipoSensor: 'Temperatura', Estado: 'Activo', FechaInstalacion: '2024-05-01', ID: 103 },
    { id: 4, nombre: 'Sensor PH Oeste', ubicacion: 'Campo Abierto B', latitud: 9.543, longitud: -76.234, cultivo: 'Yuca', fechaRegistro: '2024-05-15', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-05-05', ID: 104 },
    { id: 5, nombre: 'Sensor Luz Central', ubicacion: 'Invernadero 1', latitud: 10.345, longitud: -75.678, cultivo: 'Tomate', fechaRegistro: '2024-05-20', TipoSensor: 'Luz', Estado: 'Resuelto', FechaInstalacion: '2024-05-10', ID: 105 },
    { id: 6, nombre: 'Sensor Humedad Norte', ubicacion: 'Campo Abierto A', latitud: 9.765, longitud: -76.012, cultivo: 'Maíz', fechaRegistro: '2024-05-25', TipoSensor: 'Humedad', Estado: 'Activo', FechaInstalacion: '2024-05-15', ID: 106 },
  ];
  dataSource = new MatTableDataSource<SensorData>(this.sensores);
  expandedElement: any | null = null;
  // Filtros
  searchText: string = '';
  filterTSensor: string = '';


  // Opciones para filtros
  tipoSensorOptions: string[] = [];

  // Estado
  loading: boolean = false;

  // Columnas para mostrar
  displayedColumns: string[] = ['nombre', 'ubicacion', 'tipo sensor', 'fecha instalacion', 'Estado', 'acciones'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog
  ) { }

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
    this.obtenerSensores(); // Aseguramos que se llama para inicializar el dataSource y el filtro
    this.obtenerTipoSensorOptions();
  }

  obtenerTipoSensorOptions() {
    // Usamos los datos quemados para las opciones de tipo de sensor
    this.tipoSensorOptions = [...new Set(this.sensores.map(f => f.TipoSensor))].sort();
  }

  ngAfterViewInit() {
    // Configurar paginación y ordenamiento después de que se inicialicen las vistas
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerSensores() {
    this.loading = true;
    // this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/sensores/`).subscribe({
    //  next: (response: any) => {
    //  this.sensores = response;
    //  this.dataSource.data = this.sensores;
    //  // Obtener opciones únicas para los filtros
    //  this.tipoSensorOptions = [...new Set(this.sensores.map(f => f.TipoSensor))].sort((a, b) => a - b)
    //  // Configurar el filtro personalizado
    //  this.dataSource.filterPredicate = this.createFilterPredicate();
    //  this.loading = false;
    //  },
    //  error: (error: any) => {
    //  console.error('Error al obtener los sensores:', error);
    //  this.loading = false;
    //  }
    // });
    // Usamos los datos quemados directamente
    this.dataSource.data = this.sensores;
    this.dataSource.filterPredicate = this.createFilterPredicate(); // Configura el predicado de filtro
    this.loading = false;
    this.applyFilter(); // Aplicar filtro inicial para asegurar que se muestren los datos correctamente
  }

  createFilterPredicate() {
    return (data: SensorData, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const nombreMatch = data.nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase());
      const sensorMatch = !searchTerms.filterTSensor || data.TipoSensor === searchTerms.filterTSensor;
      // También podemos añadir el filtro por ubicación y cultivo si es necesario
      const ubicacionMatch = data.ubicacion.toLowerCase().includes(searchTerms.searchText.toLowerCase());
      const cultivoMatch = data.cultivo.toLowerCase().includes(searchTerms.searchText.toLowerCase());

      return (nombreMatch || ubicacionMatch || cultivoMatch) && sensorMatch;
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

  // Métodos para manejar eventos emitidos por CardSensorComponent
  onVerSensor(sensor: SensorData): void {
    this.verSensor(sensor); // Llama al método existente
  }

  onEditarSensor(sensor: SensorData): void {
    this.editarSensor(sensor); // Llama al método existente
  }

  onEliminarSensor(sensor: SensorData): void {
    this.eliminarSensor(sensor); // Llama al método existente
  }

  editarSensor(sensores: SensorData) {
    this.router.navigate(['/sensor/editar', sensores.ID]);
  }

  verSensor(sensores: SensorData): void {
    this.dialog.open(VersensorComponent, {
      data: {
        sensorId: sensores.ID,
        nombreSensor: sensores.nombre,
        FechaInstalacion: sensores.FechaInstalacion
      },
      width: '50%',
      maxWidth: '1200px',
      disableClose: true
    }).afterClosed().subscribe(() => {
    });
  }
  eliminarSensor(sensores: SensorData) {
    if (confirm(`¿Está seguro de eliminar el sensor "${sensores.nombre}"?`)) {
      // this.apiService.delete(`${API_URLS.MID.API_MID_SPIKE}/sensores/${sensores.ID}`).subscribe({
      //  next: (response) => { // Added response parameter
      //  this.obtenerSensores();
      //  },
      //  error: (error) => {
      //  console.error('Error al eliminar el sensor:', error);
      //  }
      // });
      // Simulación de eliminación con datos quemados
      this.sensores = this.sensores.filter(s => s.ID !== sensores.ID);
      this.dataSource.data = this.sensores;
      this.applyFilter(); // Vuelve a aplicar el filtro después de eliminar
    }
  }
}
