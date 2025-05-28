import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common'; // Import Location
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'; // Corrected import
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule and FormControl
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'; // Import MatAutocompleteModule
import { Observable, of } from 'rxjs'; // Import Observable and of
import { startWith, map } from 'rxjs/operators'; // Import operators
// Importar el componente de diálogo para ver detalles
import { VerHistorialAlertComponent } from '../ver-historial-alert/ver-historial-alert.component';

// Interfaz para la alerta (referencia)
interface Alerta {
  Id: number;
  Nombre: string;
  TipoSensor: 'PH' | 'Humedad' | 'Temperatura' | 'Luz'; // Tipos de sensor específicos
  Cultivo: string;
}

// Interfaz para el historial de alertas (basada en tu modelo Go)
interface AlertasHistorial {
  Id: number;
  IdAlerta: Alerta; // Relación con la alerta
  FechaAlerta: string; // Usamos string para simplificar con datos quemados
  Activo: boolean;
  Estado: boolean; // true: resuelta, false: pendiente/activa
  Descripcion: string;
  FechaCreacion: string;
  FechaModificacion: string;
  sensorReadings?: { timestamp: string, value: number }[];
}

@Component({
  selector: 'app-historial-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule, // Add ReactiveFormsModule
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    MatAutocompleteModule, // Add MatAutocompleteModule
    
  ],
  providers: [DatePipe],
  templateUrl: './historial-alert.component.html',
  styleUrl: './historial-alert.component.css'
})
export class HistorialAlertComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  vistaActual: 'tabla' | 'tarjeta' = 'tabla';
  loading: boolean = true;
  searchText: string = '';
  filterEstado: string = '';

  // Propiedades para el combobox de cultivo
  cultivoControl = new FormControl();
  cultivosOptions: string[] = [];
  filteredCultivosOptions!: Observable<string[]>;
  selectedCultivo: string | null = null; // This will hold the actual selected value

  showContent: boolean = false;

  historialAlertasCompleto: AlertasHistorial[] = [
    {
      Id: 1,
      IdAlerta: { Id: 101, Nombre: 'Sensor PH Lote A', TipoSensor: 'PH', Cultivo: 'Tomate' },
      FechaAlerta: '2024-05-20T10:30:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'El valor de pH ha caído por debajo del umbral mínimo en el lote A. Requiere atención inmediata.',
      FechaCreacion: '2024-05-20T10:30:00Z',
      FechaModificacion: '2024-05-20T10:30:00Z',
      sensorReadings: [
        { timestamp: '2024-05-20T10:00:00Z', value: 6.8 },
        { timestamp: '2024-05-20T10:10:00Z', value: 6.5 },
        { timestamp: '2024-05-20T10:20:00Z', value: 6.2 },
        { timestamp: '2024-05-20T10:30:00Z', value: 5.9 },
        { timestamp: '2024-05-20T10:40:00Z', value: 6.0 }
      ]
    },
    {
      Id: 2,
      IdAlerta: { Id: 102, Nombre: 'Sensor Humedad Invernadero 1', TipoSensor: 'Humedad', Cultivo: 'Lechuga' },
      FechaAlerta: '2024-05-19T14:15:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'La humedad en el invernadero 1 superó el límite. Se activó el sistema de ventilación y se normalizó.',
      FechaCreacion: '2024-05-19T14:15:00Z',
      FechaModificacion: '2024-05-19T14:30:00Z',
      sensorReadings: [
        { timestamp: '2024-05-19T13:45:00Z', value: 70 },
        { timestamp: '2024-05-19T14:00:00Z', value: 75 },
        { timestamp: '2024-05-19T14:15:00Z', value: 82 },
        { timestamp: '2024-05-19T14:30:00Z', value: 72 },
        { timestamp: '2024-05-19T14:45:00Z', value: 68 }
      ]
    },
    {
      Id: 3,
      IdAlerta: { Id: 103, Nombre: 'Sensor Temp Exterior', TipoSensor: 'Temperatura', Cultivo: 'Maíz' },
      FechaAlerta: '2024-05-18T08:00:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'Temperatura exterior por encima del rango óptimo para el cultivo de maíz. Considerar riego adicional.',
      FechaCreacion: '2024-05-18T08:00:00Z',
      FechaModificacion: '2024-05-18T08:00:00Z',
      sensorReadings: [
        { timestamp: '2024-05-18T07:30:00Z', value: 25 },
        { timestamp: '2024-05-18T07:45:00Z', value: 28 },
        { timestamp: '2024-05-18T08:00:00Z', value: 31 },
        { timestamp: '2024-05-18T08:15:00Z', value: 30 },
        { timestamp: '2024-05-18T08:30:00Z', value: 29 }
      ]
    },
    {
      Id: 4,
      IdAlerta: { Id: 104, Nombre: 'Sensor PH Lote B', TipoSensor: 'PH', Cultivo: 'Tomate' },
      FechaAlerta: '2024-05-17T09:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Variación de pH detectada y corregida en el lote B.',
      FechaCreacion: '2024-05-17T09:00:00Z',
      FechaModificacion: '2024-05-17T09:10:00Z',
      sensorReadings: [
        { timestamp: '2024-05-17T08:30:00Z', value: 7.2 },
        { timestamp: '2024-05-17T08:45:00Z', value: 7.0 },
        { timestamp: '2024-05-17T09:00:00Z', value: 6.7 },
        { timestamp: '2024-05-17T09:10:00Z', value: 7.0 },
        { timestamp: '2024-05-17T09:20:00Z', value: 7.1 }
      ]
    },
    {
      Id: 5,
      IdAlerta: { Id: 105, Nombre: 'Sensor Luz Invernadero 2', TipoSensor: 'Luz', Cultivo: 'Fresa' },
      FechaAlerta: '2024-05-16T11:00:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'Nivel de luz insuficiente en el invernadero 2. Revisar iluminación artificial.',
      FechaCreacion: '2024-05-16T11:00:00Z',
      FechaModificacion: '2024-05-16T11:00:00Z',
      sensorReadings: [
        { timestamp: '2024-05-16T10:30:00Z', value: 5000 },
        { timestamp: '2024-05-16T10:45:00Z', value: 4500 },
        { timestamp: '2024-05-16T11:00:00Z', value: 3000 },
        { timestamp: '2024-05-16T11:15:00Z', value: 3200 },
        { timestamp: '2024-05-16T11:30:00Z', value: 3500 }
      ]
    },
    {
      Id: 6,
      IdAlerta: { Id: 106, Nombre: 'Sensor Humedad Campo 3', TipoSensor: 'Humedad', Cultivo: 'Maíz' },
      FechaAlerta: '2024-05-15T09:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Humedad en el campo 3 dentro de los parámetros esperados.',
      FechaCreacion: '2024-05-15T09:00:00Z',
      FechaModificacion: '2024-05-15T09:05:00Z',
      sensorReadings: [
        { timestamp: '2024-05-15T08:30:00Z', value: 60 },
        { timestamp: '2024-05-15T08:45:00Z', value: 65 },
        { timestamp: '2024-05-15T09:00:00Z', value: 68 },
        { timestamp: '2024-05-15T09:05:00Z', value: 67 },
        { timestamp: '2024-05-15T09:20:00Z', value: 65 }
      ]
    },
    {
      Id: 7,
      IdAlerta: { Id: 107, Nombre: 'Sensor Temp Invernadero 3', TipoSensor: 'Temperatura', Cultivo: 'Pimiento' },
      FechaAlerta: '2024-05-14T16:00:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'Aumento repentino de temperatura en Invernadero 3. Verificar ventilación.',
      FechaCreacion: '2024-05-14T16:00:00Z',
      FechaModificacion: '2024-05-14T16:00:00Z',
      sensorReadings: [
        { timestamp: '2024-05-14T15:30:00Z', value: 28 },
        { timestamp: '2024-05-14T15:45:00Z', value: 30 },
        { timestamp: '2024-05-14T16:00:00Z', value: 35 },
        { timestamp: '2024-05-14T16:15:00Z', value: 34 }
      ]
    },
    {
      Id: 8,
      IdAlerta: { Id: 108, Nombre: 'Sensor PH Hidropónico', TipoSensor: 'PH', Cultivo: 'Hierbas Aromáticas' },
      FechaAlerta: '2024-05-13T09:30:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'PH estabilizado en sistema hidropónico.',
      FechaCreacion: '2024-05-13T09:30:00Z',
      FechaModificacion: '2024-05-13T09:40:00Z',
      sensorReadings: [
        { timestamp: '2024-05-13T09:00:00Z', value: 6.0 },
        { timestamp: '2024-05-13T09:15:00Z', value: 5.8 },
        { timestamp: '2024-05-13T09:30:00Z', value: 6.2 },
        { timestamp: '2024-05-13T09:45:00Z', value: 6.4 }
      ]
    },
    {
      Id: 9,
      IdAlerta: { Id: 109, Nombre: 'Sensor Luz Cultivo Exterior', TipoSensor: 'Luz', Cultivo: 'Trigo' },
      FechaAlerta: '2024-05-12T13:00:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'Baja intensidad de luz durante el día. Posible nubosidad densa.',
      FechaCreacion: '2024-05-12T13:00:00Z',
      FechaModificacion: '2024-05-12T13:00:00Z',
      sensorReadings: [
        { timestamp: '2024-05-12T12:30:00Z', value: 25000 },
        { timestamp: '2024-05-12T12:45:00Z', value: 18000 },
        { timestamp: '2024-05-12T13:00:00Z', value: 8000 },
        { timestamp: '2024-05-12T13:15:00Z', value: 9000 }
      ]
    },
    {
      Id: 10,
      IdAlerta: { Id: 110, Nombre: 'Sensor Humedad Lote 4', TipoSensor: 'Humedad', Cultivo: 'Arroz' },
      FechaAlerta: '2024-05-11T10:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Niveles de humedad adecuados en el lote de arroz.',
      FechaCreacion: '2024-05-11T10:00:00Z',
      FechaModificacion: '2024-05-11T10:10:00Z',
      sensorReadings: [
        { timestamp: '2024-05-11T09:30:00Z', value: 80 },
        { timestamp: '2024-05-11T09:45:00Z', value: 85 },
        { timestamp: '2024-05-11T10:00:00Z', value: 90 },
        { timestamp: '2024-05-11T10:15:00Z', value: 88 }
      ]
    },
    {
      Id: 11,
      IdAlerta: { Id: 111, Nombre: 'Sensor Temp Invernadero 4', TipoSensor: 'Temperatura', Cultivo: 'Tomate' },
      FechaAlerta: '2024-05-10T11:00:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'Temperatura por debajo del umbral en Invernadero 4. Activar calefacción.',
      FechaCreacion: '2024-05-10T11:00:00Z',
      FechaModificacion: '2024-05-10T11:00:00Z',
      sensorReadings: [
        { timestamp: '2024-05-10T10:30:00Z', value: 15 },
        { timestamp: '2024-05-10T10:45:00Z', value: 12 },
        { timestamp: '2024-05-10T11:00:00Z', value: 8 },
        { timestamp: '2024-05-10T11:15:00Z', value: 10 }
      ]
    },
    {
      Id: 12,
      IdAlerta: { Id: 112, Nombre: 'Sensor Humedad Lote 5', TipoSensor: 'Humedad', Cultivo: 'Fresa' },
      FechaAlerta: '2024-05-09T14:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Humedad óptima en el lote de fresas.',
      FechaCreacion: '2024-05-09T14:00:00Z',
      FechaModificacion: '2024-05-09T14:05:00Z',
      sensorReadings: [
        { timestamp: '2024-05-09T13:30:00Z', value: 65 },
        { timestamp: '2024-05-09T13:45:00Z', value: 70 },
        { timestamp: '2024-05-09T14:00:00Z', value: 75 },
        { timestamp: '2024-05-09T14:15:00Z', value: 72 }
      ]
    },
    {
      Id: 13,
      IdAlerta: { Id: 113, Nombre: 'Sensor PH Campo 1', TipoSensor: 'PH', Cultivo: 'Trigo' },
      FechaAlerta: '2024-05-08T08:30:00Z',
      Activo: true,
      Estado: false,
      Descripcion: 'PH bajo en el campo de trigo. Aplicar correctivos de suelo.',
      FechaCreacion: '2024-05-08T08:30:00Z',
      FechaModificacion: '2024-05-08T08:30:00Z',
      sensorReadings: [
        { timestamp: '2024-05-08T08:00:00Z', value: 6.0 },
        { timestamp: '2024-05-08T08:15:00Z', value: 5.8 },
        { timestamp: '2024-05-08T08:30:00Z', value: 5.5 },
        { timestamp: '2024-05-08T08:45:00Z', value: 5.6 }
      ]
    },
    {
      Id: 14,
      IdAlerta: { Id: 114, Nombre: 'Sensor Luz Invernadero 5', TipoSensor: 'Luz', Cultivo: 'Pimiento' },
      FechaAlerta: '2024-05-07T12:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Nivel de luz adecuado en Invernadero 5.',
      FechaCreacion: '2024-05-07T12:00:00Z',
      FechaModificacion: '2024-05-07T12:05:00Z',
      sensorReadings: [
        { timestamp: '2024-05-07T11:30:00Z', value: 10000 },
        { timestamp: '2024-05-07T11:45:00Z', value: 12000 },
        { timestamp: '2024-05-07T12:00:00Z', value: 15000 },
        { timestamp: '2024-05-07T12:15:00Z', value: 14500 }
      ]
    },
    {
      Id: 15,
      IdAlerta: { Id: 115, Nombre: 'Sensor Temp Campo 2', TipoSensor: 'Temperatura', Cultivo: 'Arroz' },
      FechaAlerta: '2024-05-06T15:00:00Z',
      Activo: true,
      Estado: true,
      Descripcion: 'Temperatura estable en el campo de arroz.',
      FechaCreacion: '2024-05-06T15:00:00Z',
      FechaModificacion: '2024-05-06T15:10:00Z',
      sensorReadings: [
        { timestamp: '2024-05-06T14:30:00Z', value: 27 },
        { timestamp: '2024-05-06T14:45:00Z', value: 26 },
        { timestamp: '2024-05-06T15:00:00Z', value: 25 },
        { timestamp: '2024-05-06T15:15:00Z', value: 25 }
      ]
    }
  ];
  dataSource = new MatTableDataSource<AlertasHistorial>([]);
  displayedColumns: string[] = ['id', 'alertaNombre', 'fechaAlerta', 'descripcion', 'estado', 'acciones'];

  constructor(private dialog: MatDialog, private location: Location) { }

  public isMobileView(): boolean { // Changed to public
    return window.innerWidth <= 768; // Define mobile breakpoint
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isMobileView()) {
      this.vistaActual = 'tarjeta'; // Force card view on mobile
    } else {
      this.vistaActual = 'tabla'; // Return to table view on desktop
    }
  }

  ngOnInit(): void {
    this.vistaActual = this.isMobileView() ? 'tarjeta' : 'tabla'; // Set initial view
    this.populateCultivosOptions();

    // Initialize filteredCultivosOptions for the autocomplete
    this.filteredCultivosOptions = this.cultivoControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCultivos(value || ''))
    );

    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  populateCultivosOptions(): void {
    this.cultivosOptions = [...new Set(this.historialAlertasCompleto.map(a => a.IdAlerta.Cultivo))].sort();
  }

  private _filterCultivos(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cultivosOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  onCultivoSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedCultivo = event.option.value;
    this.onCultivoSelectChange(); // Trigger the filter logic
  }

  // This function is called when the input value changes, even if not selected from autocomplete
  onCultivoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    // If the input value doesn't exactly match an existing option, clear selectedCultivo
    if (!this.cultivosOptions.includes(inputValue)) {
      this.selectedCultivo = null;
      this.showContent = false; // Hide content if no valid crop is selected
      this.dataSource.data = []; // Clear table data
    } else {
      // If it matches an option, set selectedCultivo and trigger change
      this.selectedCultivo = inputValue;
      this.onCultivoSelectChange();
    }
  }

  onCultivoSelectChange(): void {
    if (this.selectedCultivo) {
      this.showContent = true;
      this.loading = true;
      setTimeout(() => {
        const filteredByCultivo = this.historialAlertasCompleto.filter(alerta =>
          alerta.IdAlerta.Cultivo === this.selectedCultivo
        );
        this.dataSource.data = filteredByCultivo;
        this.dataSource.filterPredicate = this.createFilterPredicate();
        this.applyFilter();
        this.loading = false;
      }, 300);
    } else {
      this.showContent = false;
      this.dataSource.data = [];
      this.applyFilter();
    }
  }

  createFilterPredicate() {
    return (data: AlertasHistorial, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);

      const searchMatch = data.Descripcion.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
                          data.IdAlerta.Nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
                          data.IdAlerta.TipoSensor.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
                          data.IdAlerta.Cultivo.toLowerCase().includes(searchTerms.searchText.toLowerCase());

      const estadoMatch = searchTerms.filterEstado === '' ||
                          (searchTerms.filterEstado === 'true' && data.Estado === true) ||
                          (searchTerms.filterEstado === 'false' && data.Estado === false);

      return searchMatch && estadoMatch;
    };
  }

  applyFilter(): void {
    const filterValue = JSON.stringify({
      searchText: this.searchText.trim(),
      filterEstado: this.filterEstado
    });
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();    }
  }

  verDetalles(alerta: AlertasHistorial): void {
    this.dialog.open(VerHistorialAlertComponent, {
      data: alerta,
      width: '650px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container'
    });
  }

  // Helper para obtener el color de fondo ligero para las filas de la tabla
  getTableRowBackgroundColor(estado: boolean): string {
    return estado ? '#F0FFF4' : '#FFFBEB'; // Very light green for resolved, very light yellow for pending
  }

  // Helper para obtener el color del texto del estado (para el chip)
  getStatusChipColor(estado: boolean): string {
    return estado ? '#4CAF50' : '#FFC107'; // Green for resolved, Yellow for pending
  }

  // Helper para obtener el texto del estado
  getStatusText(estado: boolean): string {
    return estado ? 'Resuelta' : 'Pendiente';
  }

  // Helper para obtener el icono del tipo de sensor
  getSensorTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'PH': return 'science';
      case 'Humedad': return 'water_damage';
      case 'Temperatura': return 'thermostat';
      case 'Luz': return 'light_mode';
      default: return 'sensors';
    }
  }

  onExit(): void {
    this.location.back(); // Go back to the previous location
  }
}
