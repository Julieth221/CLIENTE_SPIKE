import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule
import { VerHistorialAlertComponent } from '../ver-historial-alert/ver-historial-alert.component';// Importar el componente de diálogo para ver detalles
import { MatOptionModule } from '@angular/material/core';

// Interfaz para la alerta (referencia)
interface Alerta {
  Id: number;
  Nombre: string;
  TipoSensor: 'PH' | 'Humedad' | 'Temperatura' | 'Luz'; // Tipos de sensor específicos
  Cultivo: string;
  // ... otras propiedades de la alerta si son necesarias para mostrar en el historial
}

// Interfaz para el historial de alertas (basada en tu modelo Go)
interface AlertasHistorial {
  Id: number;
  IdAlerta: Alerta; // Relación con la alerta
  FechaAlerta: string; // Usamos string para simplificar con datos quemados
  Estado: boolean; // true: resuelta, false: pendiente/activa
  Descripcion: string;
  // Añadimos datos de lectura del sensor para el gráfico en el diálogo
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
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatOptionModule,
    MatSelectModule,
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
  filterEstado: string = ''; // 'true' para resueltas, 'false' para activas/pendientes, '' para todas

  // Nuevas propiedades para el filtro de cultivo
  cultivosOptions: string[] = [];
  selectedCultivo: string | null = null;
  showContent: boolean = false; // Controla la visibilidad de la tabla/tarjetas

  historialAlertasCompleto: AlertasHistorial[] = [
    // Datos quemados para simular el historial de alertas
    {
      Id: 1,
      IdAlerta: { Id: 101, Nombre: 'Alerta PH Lote A', TipoSensor: 'PH', Cultivo: 'Tomate' },
      FechaAlerta: '2024-05-20T10:30:00Z',
      Estado: false, // Pendiente
      Descripcion: 'El valor de pH ha caído por debajo del umbral mínimo en el lote A. Requiere atención inmediata.',
      sensorReadings: [
        { timestamp: '2024-05-20T10:00:00Z', value: 6.8 },
        { timestamp: '2024-05-20T10:10:00Z', value: 6.5 },
        { timestamp: '2024-05-20T10:20:00Z', value: 6.2 },
        { timestamp: '2024-05-20T10:30:00Z', value: 5.9 } // Punto de alerta
      ]
    },
    {
      Id: 2,
      IdAlerta: { Id: 102, Nombre: 'Alerta Humedad Invernadero 1', TipoSensor: 'Humedad', Cultivo: 'Lechuga' },
      FechaAlerta: '2024-05-19T14:15:00Z',
      Estado: true, // Resuelta
      Descripcion: 'La humedad en el invernadero 1 superó el límite. Se activó el sistema de ventilación y se normalizó.',
      sensorReadings: [
        { timestamp: '2024-05-19T13:45:00Z', value: 70 },
        { timestamp: '2024-05-19T14:00:00Z', value: 75 },
        { timestamp: '2024-05-19T14:15:00Z', value: 82 }, // Punto de alerta
        { timestamp: '2024-05-19T14:30:00Z', value: 72 }
      ]
    },
    {
      Id: 3,
      IdAlerta: { Id: 103, Nombre: 'Alerta Temp Exterior', TipoSensor: 'Temperatura', Cultivo: 'Maíz' },
      FechaAlerta: '2024-05-18T08:00:00Z',
      Estado: false, // Pendiente
      Descripcion: 'Temperatura exterior por encima del rango óptimo para el cultivo de maíz. Considerar riego adicional.',
      sensorReadings: [
        { timestamp: '2024-05-18T07:30:00Z', value: 25 },
        { timestamp: '2024-05-18T07:45:00Z', value: 28 },
        { timestamp: '2024-05-18T08:00:00Z', value: 31 }, // Punto de alerta
        { timestamp: '2024-05-18T08:15:00Z', value: 30 }
      ]
    },
    {
      Id: 4,
      IdAlerta: { Id: 101, Nombre: 'Alerta PH Lote A', TipoSensor: 'PH', Cultivo: 'Tomate' },
      FechaAlerta: '2024-05-17T09:00:00Z',
      Estado: true, // Resuelta
      Descripcion: 'Variación de pH detectada y corregida en el lote A.',
      sensorReadings: [
        { timestamp: '2024-05-17T08:30:00Z', value: 7.2 },
        { timestamp: '2024-05-17T08:45:00Z', value: 7.0 },
        { timestamp: '2024-05-17T09:00:00Z', value: 6.7 }, // Punto de alerta
        { timestamp: '2024-05-17T09:10:00Z', value: 7.0 }
      ]
    },
    {
      Id: 5,
      IdAlerta: { Id: 104, Nombre: 'Alerta Luz Invernadero 2', TipoSensor: 'Luz', Cultivo: 'Fresa' },
      FechaAlerta: '2024-05-16T11:00:00Z',
      Estado: false, // Pendiente
      Descripcion: 'Nivel de luz insuficiente en el invernadero 2. Revisar iluminación artificial.',
      sensorReadings: [
        { timestamp: '2024-05-16T10:30:00Z', value: 5000 },
        { timestamp: '2024-05-16T10:45:00Z', value: 4500 },
        { timestamp: '2024-05-16T11:00:00Z', value: 3000 }, // Punto de alerta
        { timestamp: '2024-05-16T11:15:00Z', value: 3200 }
      ]
    },
    {
      Id: 6,
      IdAlerta: { Id: 105, Nombre: 'Alerta Humedad Campo 3', TipoSensor: 'Humedad', Cultivo: 'Maíz' },
      FechaAlerta: '2024-05-15T09:00:00Z',
      Estado: true, // Resuelta
      Descripcion: 'Humedad en el campo 3 dentro de los parámetros esperados.',
      sensorReadings: [
        { timestamp: '2024-05-15T08:30:00Z', value: 60 },
        { timestamp: '2024-05-15T08:45:00Z', value: 65 },
        { timestamp: '2024-05-15T09:00:00Z', value: 68 }, // Punto de alerta
        { timestamp: '2024-05-15T09:05:00Z', value: 67 }
      ]
    }
  ];
  dataSource = new MatTableDataSource<AlertasHistorial>([]);
  displayedColumns: string[] = ['id', 'alertaNombre', 'fechaAlerta', 'descripcion', 'estado', 'acciones'];

  constructor(private dialog: MatDialog) { }

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
    this.populateCultivosOptions();
    // No cargar historial al inicio, esperar selección de cultivo
    this.loading = false; // Ya no estamos cargando al inicio
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  populateCultivosOptions(): void {
    this.cultivosOptions = [...new Set(this.historialAlertasCompleto.map(a => a.IdAlerta.Cultivo))].sort();
  }

  onCultivoSelectChange(): void {
    if (this.selectedCultivo) {
      this.showContent = true; // Mostrar la tabla/tarjetas
      this.loading = true;
      setTimeout(() => {
        // Filtrar el historial completo por el cultivo seleccionado
        const filteredByCultivo = this.historialAlertasCompleto.filter(alerta =>
          alerta.IdAlerta.Cultivo === this.selectedCultivo
        );
        this.dataSource.data = filteredByCultivo;
        this.dataSource.filterPredicate = this.createFilterPredicate();
        this.applyFilter(); // Aplicar filtro después de cargar los datos
        this.loading = false;
      }, 300); // Simula carga
    } else {
      this.showContent = false; // Ocultar la tabla/tarjetas
      this.dataSource.data = []; // Limpiar datos
      this.applyFilter(); // Limpiar filtros
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
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalles(alerta: AlertasHistorial): void {
    this.dialog.open(VerHistorialAlertComponent, {
      data: alerta, // Pasamos el objeto completo de la alerta histórica
      width: '650px', // Ancho ajustado para el gráfico
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container' // Clase CSS para personalizar el diálogo
    });
  }

  // Helper para obtener el color del estado
  getStatusColor(estado: boolean): string {
    return estado ? '#4CAF50' : '#FFC107'; // Verde para resuelta, Amarillo para pendiente
  }

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
}