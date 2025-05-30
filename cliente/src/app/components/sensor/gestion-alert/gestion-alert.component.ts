import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router'; // Importar Router

// Interfaz para la alerta
interface Alerta {
  id: number;
  nombreAlerta: string;
  descripcion: string;
  tipoAlerta: string;
  prioridad: string;
  estado: string; // 'Activa', 'Inactiva', 'Resuelta'
  nombreCultivo: string;
  tipoSesnor: string; // Mantengo el typo 'tipoSesnor' para consistencia con el HTML existente
  sensorReferenciado: string;
  ubicacion: string;
}

@Component({
  selector: 'app-gestion-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule, // Se mantiene si hay otros formularios reactivos en el componente (ej. filtros si fueran reactivos)
    FormsModule, // Necesario para ngModel en los filtros
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './gestion-alert.component.html',
  styleUrl: './gestion-alert.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0', padding: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('void => *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ]
})
export class GestionAlertComponent implements OnInit, AfterViewInit {
  // Se eliminan alertaForm y isEditing ya que la tarjeta de detalles no es un formulario editable aquí
  // alertaForm: FormGroup;
  // isEditing: boolean = false;

  loading: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  alertas: Alerta[] = []; // Todas las alertas cargadas
  alertaSeleccionada: Alerta | null = null;

  // Opciones para los filtros
  tipoAlertaOptions: string[] = ['Temperatura', 'Humedad', 'Luz', 'PH', 'General'];
  prioridadOptions: string[] = ['Alta', 'Media', 'Baja']; // Se mantiene por si se usa en la visualización
  estadoOptions: string[] = ['Activa', 'Inactiva', 'Resuelta']; // Se mantiene por si se usa en la visualización
  cultivoOptions: string[] = []; // Se llenará dinámicamente

  // Variables para los filtros
  searchText: string = '';
  filterCultivo: string = '';
  filterTSensor: string = '';

  // DataSource para la paginación y ordenamiento (funciona sobre la lista plana)
  dataSource: MatTableDataSource<Alerta>;

  // Objeto para agrupar las alertas por cultivo para la vista de tarjetas
  groupedAlertsByCultivo: Record<string, Alerta[]> = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private location: Location,
    // private fb: FormBuilder, // Se elimina FormBuilder
    private snackBar: MatSnackBar,
    private router: Router // Inyectar Router
  ) {
    // Ya no se inicializa alertaForm aquí
    this.dataSource = new MatTableDataSource<Alerta>();
  }

  ngOnInit(): void {
    this.cargarAlertas(); // Cargar las alertas al iniciar el componente

    // Suscribirse a los cambios en el dataSource para reagrupar las alertas
    this.dataSource.connect().pipe(
      map(data => this.groupAlerts(data))
    ).subscribe(groupedData => {
      this.groupedAlertsByCultivo = groupedData;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Configurar el predicado de filtro personalizado
    this.dataSource.filterPredicate = this.createFilterPredicate();
    this.applyFilter(); // Aplicar filtros iniciales para que la vista se muestre correctamente al cargar
  }

  // Carga las alertas (datos quemados para simulación)
  cargarAlertas(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    setTimeout(() => {
      this.alertas = [
        {
          id: 1, nombreAlerta: 'Alerta de Alta Temperatura', descripcion: 'Temperatura crítica en Invernadero 1', tipoAlerta: 'Temperatura', prioridad: 'Alta', estado: 'Activa',
          nombreCultivo: 'Tomate Cherry', tipoSesnor: 'DHT22', sensorReferenciado: 'Sensor_Temp_001', ubicacion: 'Sección A, Fila 3'
        },
        {
          id: 2, nombreAlerta: 'Alerta de Baja Humedad', descripcion: 'Humedad insuficiente en Campo Abierto 2', tipoAlerta: 'Humedad', prioridad: 'Media', estado: 'Inactiva',
          nombreCultivo: 'Maíz Dulce', tipoSesnor: 'Higrómetro', sensorReferenciado: 'Sensor_Hum_005', ubicacion: 'Parcela Norte'
        },
        {
          id: 3, nombreAlerta: 'Alerta de Falla de Luz', descripcion: 'Fallo en el sistema de iluminación Invernadero 3', tipoAlerta: 'Luz', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Lechuga Romana', tipoSesnor: 'LDR', sensorReferenciado: 'Sensor_Lux_010', ubicacion: 'Área Hidropónica'
        },
        {
          id: 4, nombreAlerta: 'Alerta PH Alto', descripcion: 'Nivel de PH elevado en la zona de cultivo hidropónico', tipoAlerta: 'PH', prioridad: 'Alta', estado: 'Activa',
          nombreCultivo: 'Fresas', tipoSesnor: 'PH Metter', sensorReferenciado: 'Sensor_PH_003', ubicacion: 'Sistema NFT'
        },
        {
          id: 5, nombreAlerta: 'Alerta General de Riego', descripcion: 'Problemas con el sistema de riego central', tipoAlerta: 'General', prioridad: 'Media', estado: 'Inactiva',
          nombreCultivo: 'Pimientos', tipoSesnor: 'Flujo de agua', sensorReferenciado: 'Bomba_Riego_Central', ubicacion: 'Control Principal'
        },
        {
          id: 6, nombreAlerta: 'Humedad Excesiva', descripcion: 'Humedad muy alta en invernadero de Tomate', tipoAlerta: 'Humedad', prioridad: 'Media', estado: 'Activa',
          nombreCultivo: 'Tomate Cherry', tipoSesnor: 'Higrómetro', sensorReferenciado: 'Sensor_Hum_002', ubicacion: 'Sección B, Fila 1'
        },
        {
          id: 7, nombreAlerta: 'Baja Temperatura Nocturna', descripcion: 'Temperatura baja en campo de Maíz durante la noche', tipoAlerta: 'Temperatura', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Maíz Dulce', tipoSesnor: 'DHT22', sensorReferenciado: 'Sensor_Temp_006', ubicacion: 'Parcela Sur'
        },
        {
          id: 8, nombreAlerta: 'PH Bajo', descripcion: 'Nivel de PH bajo en sistema hidropónico de Lechuga', tipoAlerta: 'PH', prioridad: 'Alta', estado: 'Activa',
          nombreCultivo: 'Lechuga Romana', tipoSesnor: 'PH Metter', sensorReferenciado: 'Sensor_PH_004', ubicacion: 'Sistema DWC'
        },
        {
          id: 9, nombreAlerta: 'Luz Insuficiente', descripcion: 'Nivel de luz por debajo del umbral en Invernadero 3', tipoAlerta: 'Luz', prioridad: 'Media', estado: 'Inactiva',
          nombreCultivo: 'Lechuga Romana', tipoSesnor: 'LDR', sensorReferenciado: 'Sensor_Lux_011', ubicacion: 'Área de Semilleros'
        },
        {
          id: 10, nombreAlerta: 'Falla de Bomba', descripcion: 'Bomba de agua principal del sistema de riego no funciona', tipoAlerta: 'General', prioridad: 'Alta', estado: 'Activa',
          nombreCultivo: 'Pimientos', tipoSesnor: 'Flujo de agua', sensorReferenciado: 'Bomba_Riego_Principal', ubicacion: 'Cuarto de Bombas'
        },
        {
          id: 11, nombreAlerta: 'PH Normalizado', descripcion: 'Nivel de PH en rango óptimo en cultivo de Fresas', tipoAlerta: 'PH', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Fresas', tipoSesnor: 'PH Metter', sensorReferenciado: 'Sensor_PH_003', ubicacion: 'Sistema NFT'
        },
        {
          id: 12, nombreAlerta: 'Alerta de Temperatura Baja', descripcion: 'Temperatura baja en Invernadero 1', tipoAlerta: 'Temperatura', prioridad: 'Media', estado: 'Activa',
          nombreCultivo: 'Tomate Cherry', tipoSesnor: 'DHT22', sensorReferenciado: 'Sensor_Temp_001', ubicacion: 'Sección A, Fila 3'
        },
        {
          id: 13, nombreAlerta: 'Alerta de Humedad Baja', descripcion: 'Humedad muy baja en Campo Abierto 2', tipoAlerta: 'Humedad', prioridad: 'Alta', estado: 'Activa',
          nombreCultivo: 'Maíz Dulce', tipoSesnor: 'Higrómetro', sensorReferenciado: 'Sensor_Hum_005', ubicacion: 'Parcela Norte'
        },
        {
          id: 14, nombreAlerta: 'Alerta de Luz Excesiva', descripcion: 'Nivel de luz muy alto en Invernadero 3', tipoAlerta: 'Luz', prioridad: 'Baja', estado: 'Inactiva',
          nombreCultivo: 'Lechuga Romana', tipoSesnor: 'LDR', sensorReferenciado: 'Sensor_Lux_010', ubicacion: 'Área Hidropónica'
        },
        {
          id: 15, nombreAlerta: 'Alerta PH Bajo', descripcion: 'Nivel de PH muy bajo en cultivo hidropónico de Fresas', tipoAlerta: 'PH', prioridad: 'Media', estado: 'Activa',
          nombreCultivo: 'Fresas', tipoSesnor: 'PH Metter', sensorReferenciado: 'Sensor_PH_003', ubicacion: 'Sistema NFT'
        },
        {
          id: 16, nombreAlerta: 'Alerta de Riego Manual', descripcion: 'Riego manual activado en Pimientos', tipoAlerta: 'General', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Pimientos', tipoSesnor: 'Flujo de agua', sensorReferenciado: 'Bomba_Riego_Secundaria', ubicacion: 'Control Auxiliar'
        },
        {
          id: 17, nombreAlerta: 'Alerta de Temperatura Óptima', descripcion: 'Temperatura en rango óptimo en Invernadero 1', tipoAlerta: 'Temperatura', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Tomate Cherry', tipoSesnor: 'DHT22', sensorReferenciado: 'Sensor_Temp_001', ubicacion: 'Sección A, Fila 3'
        },
        {
          id: 18, nombreAlerta: 'Alerta de Humedad Óptima', descripcion: 'Humedad en rango óptimo en Campo Abierto 2', tipoAlerta: 'Humedad', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Maíz Dulce', tipoSesnor: 'Higrómetro', sensorReferenciado: 'Sensor_Hum_005', ubicacion: 'Parcela Norte'
        },
        {
          id: 19, nombreAlerta: 'Alerta de Luz Normal', descripcion: 'Nivel de luz normal en Invernadero 3', tipoAlerta: 'Luz', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Lechuga Romana', tipoSesnor: 'LDR', sensorReferenciado: 'Sensor_Lux_010', ubicacion: 'Área Hidropónica'
        },
        {
          id: 20, nombreAlerta: 'Alerta PH Normal', descripcion: 'Nivel de PH normal en cultivo hidropónico de Fresas', tipoAlerta: 'PH', prioridad: 'Baja', estado: 'Resuelta',
          nombreCultivo: 'Fresas', tipoSesnor: 'PH Metter', sensorReferenciado: 'Sensor_PH_003', ubicacion: 'Sistema NFT'
        }
      ];
      this.dataSource.data = this.alertas; // Asignar todas las alertas al dataSource

      // Llenar las opciones de los filtros dinámicamente
      this.cultivoOptions = [...new Set(this.alertas.map(a => a.nombreCultivo))].sort();
      this.tipoAlertaOptions = [...new Set(this.alertas.map(a => a.tipoSesnor))].sort();

      this.loading = false;
      this.applyFilter(); // Aplicar los filtros iniciales y agrupar las alertas
    }, 1000);
  }

  // Muestra la alerta seleccionada en el panel de detalles
  verAlerta(alerta: Alerta): void {
    this.alertaSeleccionada = alerta;
  }

  // Redirige al componente de edición de alertas
  editarAlerta(): void {
    if (this.alertaSeleccionada) {
      // Asume que la ruta para editar alertas es '/dashboard/alertas/editar'
      // y que el componente de edición (EditAlertComponent) sabrá cómo recibir el estado.
      this.router.navigate(['/dashboard/alertas/editar', this.alertaSeleccionada.id], { state: { alerta: this.alertaSeleccionada } });
    } else {
      this.snackBar.open('No hay alerta seleccionada para editar.', 'Cerrar', { duration: 3000 });
    }
  }

  // Elimina una alerta
  eliminarAlerta(alerta: Alerta): void {
    // Usar un modal personalizado en lugar de `confirm()`
    const confirmation = window.confirm(`¿Está seguro de eliminar la alerta "${alerta.nombreAlerta}"?`);
    if (confirmation) {
      this.alertas = this.alertas.filter(a => a.id !== alerta.id);
      this.dataSource.data = this.alertas; // Actualizar el dataSource
      this.alertaSeleccionada = null; // Limpiar la vista de detalle
      this.snackBar.open('Alerta eliminada con éxito.', 'Cerrar', { duration: 3000 });
      this.applyFilter(); // Re-aplicar filtros y reagrupar
    }
  }

  // Limpia los filtros
  clearFilters(): void {
    this.searchText = '';
    this.filterCultivo = '';
    this.filterTSensor = '';
    this.applyFilter();
  }

  // Navega de regreso a la ubicación anterior
  onExit(): void {
    this.location.back();
  }

  // Crea el predicado de filtro personalizado
  createFilterPredicate() {
    return (data: Alerta, filter: string) => {
      const searchTerms = JSON.parse(filter);

      const searchTextMatch = data.nombreAlerta.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
                              data.descripcion.toLowerCase().includes(searchTerms.searchText.toLowerCase());

      const cultivoMatch = !searchTerms.filterCultivo || data.nombreCultivo === searchTerms.filterCultivo;
      const tipoSensorMatch = !searchTerms.filterTSensor || data.tipoSesnor === searchTerms.filterTSensor;

      return searchTextMatch && cultivoMatch && tipoSensorMatch;
    };
  }

  // Aplica los filtros a los datos y actualiza la vista
  applyFilter(): void {
    const filterValue = JSON.stringify({
      searchText: this.searchText.trim().toLowerCase(),
      filterCultivo: this.filterCultivo,
      filterTSensor: this.filterTSensor
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Agrupa las alertas por nombre de cultivo
  groupAlerts(alertsToGroup: Alerta[]): Record<string, Alerta[]> {
    const grouped: Record<string, Alerta[]> = {};
    alertsToGroup.forEach(alerta => {
      if (!grouped[alerta.nombreCultivo]) {
        grouped[alerta.nombreCultivo] = [];
      }
      grouped[alerta.nombreCultivo].push(alerta);
    });
    return grouped;
  }
}
