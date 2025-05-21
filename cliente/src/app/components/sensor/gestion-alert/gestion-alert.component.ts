import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip'; // Import MatTooltipModule

interface Alerta {
  id: number;
  nombreAlerta: string;
  descripcion: string;
  tipoAlerta: string;
  prioridad: string;
  estado: string;
  // Nuevos campos quemados
  nombreCultivo: string;
  tipoSesnor: string; // Typo from original request, keeping for consistency. Should be 'tipoSensor'
  sensorReferenciado: string;
  ubicacion: string;
}

@Component({
  selector: 'app-gestion-alert',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule // Add MatTooltipModule here
  ],
  templateUrl: './gestion-alert.component.html',
  styleUrl: './gestion-alert.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0', padding: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('void => *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')) // Added for initial render animation
    ]),
  ]
})
export class GestionAlertComponent implements OnInit, AfterViewInit {
  alertaForm: FormGroup;
  isEditing: boolean = false;
  loading: boolean = false;
  error: boolean = false;
  errorMessage: string = '';
  alertas: Alerta[] = [];
  alertaSeleccionada: Alerta | null = null;

  tipoAlertaOptions: string[] = ['Temperatura', 'Humedad', 'Luz', 'PH', 'General'];
  prioridadOptions: string[] = ['Alta', 'Media', 'Baja'];
  estadoOptions: string[] = ['Activa', 'Inactiva', 'Resuelta'];

  dataSource: MatTableDataSource<Alerta>;
  displayedColumns: string[] = ['nombreAlerta', 'tipoAlerta', 'prioridad', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.alertaForm = this.fb.group({
      nombreAlerta: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoAlerta: ['', Validators.required],
      prioridad: ['', Validators.required],
      estado: ['', Validators.required],
      nombreCultivo: [''], // New field
      tipoSesnor: [''],   // New field (typo retained)
      sensorReferenciado: [''], // New field
      ubicacion: ['']     // New field
    });
    this.dataSource = new MatTableDataSource<Alerta>();
  }

  ngOnInit(): void {
    this.cargarAlertas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarAlertas(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    // Simulación de carga de alertas con nuevos campos
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
      ];
      this.dataSource.data = this.alertas;
      this.loading = false;
    }, 1000);
  }

  verAlerta(alerta: Alerta): void {
    this.alertaSeleccionada = alerta;
    this.cargarDatosAlerta();
    this.isEditing = false;
    // Disable form fields when in view mode
    this.alertaForm.disable();
  }

  editarAlerta(): void {
    this.isEditing = true;
    this.alertaForm.enable();
    // Disable specific fields that should remain read-only even in edit mode
    this.alertaForm.get('nombreCultivo')?.disable();
    this.alertaForm.get('tipoSesnor')?.disable();
    this.alertaForm.get('sensorReferenciado')?.disable();
    this.alertaForm.get('ubicacion')?.disable();
  }

  guardarAlerta(): void {
    if (this.alertaForm.valid && this.alertaSeleccionada) {
      // Re-enable disabled fields temporarily to get their values
      this.alertaForm.get('nombreCultivo')?.enable();
      this.alertaForm.get('tipoSesnor')?.enable();
      this.alertaForm.get('sensorReferenciado')?.enable();
      this.alertaForm.get('ubicacion')?.enable();

      // Update the selected alert with form values
      this.alertaSeleccionada = {
        ...this.alertaSeleccionada,
        nombreAlerta: this.alertaForm.value.nombreAlerta,
        descripcion: this.alertaForm.value.descripcion,
        tipoAlerta: this.alertaForm.value.tipoAlerta,
        prioridad: this.alertaForm.value.prioridad,
        estado: this.alertaForm.value.estado,
        // The read-only fields keep their original value, or you could update them from the form if they were enabled
        nombreCultivo: this.alertaForm.value.nombreCultivo,
        tipoSesnor: this.alertaForm.value.tipoSesnor,
        sensorReferenciado: this.alertaForm.value.sensorReferenciado,
        ubicacion: this.alertaForm.value.ubicacion
      };

      const index = this.alertas.findIndex(a => a.id === this.alertaSeleccionada!.id);
      if (index > -1) {
        this.alertas[index] = this.alertaSeleccionada;
      }
      this.dataSource.data = this.alertas; // Update table data source

      this.snackBar.open('Alerta actualizada con éxito.', 'Cerrar', { duration: 3000 });
      this.isEditing = false;
      this.alertaForm.disable(); // Disable form after saving
      this.cargarAlertas(); // Re-load alerts to reflect changes
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 3000 });
      // Re-disable fields if form was invalid (to maintain read-only state)
      if (!this.isEditing) { // Only if not in edit mode
         this.alertaForm.get('nombreCultivo')?.disable();
         this.alertaForm.get('tipoSesnor')?.disable();
         this.alertaForm.get('sensorReferenciado')?.disable();
         this.alertaForm.get('ubicacion')?.disable();
      }
    }
  }

  eliminarAlerta(alerta: Alerta): void {
    if (confirm(`¿Está seguro de eliminar la alerta "${alerta.nombreAlerta}"?`)) {
      this.alertas = this.alertas.filter(a => a.id !== alerta.id);
      this.dataSource.data = this.alertas; // Update table data source
      this.alertaSeleccionada = null; // Clear the detail view
      this.snackBar.open('Alerta eliminada con éxito.', 'Cerrar', { duration: 3000 });
    }
  }

  cancelarEdicion(): void {
    this.isEditing = false;
    this.alertaForm.disable(); // Disable form after canceling
    this.cargarDatosAlerta(); // Revert to original data
  }

  onExit(): void {
    this.location.back();
  }

  cargarDatosAlerta(): void {
    if (this.alertaSeleccionada) {
      this.alertaForm.patchValue({
        nombreAlerta: this.alertaSeleccionada.nombreAlerta,
        descripcion: this.alertaSeleccionada.descripcion,
        tipoAlerta: this.alertaSeleccionada.tipoAlerta,
        prioridad: this.alertaSeleccionada.prioridad,
        estado: this.alertaSeleccionada.estado,
        nombreCultivo: this.alertaSeleccionada.nombreCultivo,
        tipoSesnor: this.alertaSeleccionada.tipoSesnor,
        sensorReferenciado: this.alertaSeleccionada.sensorReferenciado,
        ubicacion: this.alertaSeleccionada.ubicacion
      });
    }
  }
}
