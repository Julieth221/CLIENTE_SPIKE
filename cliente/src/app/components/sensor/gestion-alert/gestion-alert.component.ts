import { Component, OnInit, ViewChild } from '@angular/core';
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

interface Alerta {
  id: number;
  nombreAlerta: string;
  descripcion: string;
  tipoAlerta: string;
  prioridad: string;
  estado: string;
}

@Component({
  selector: 'app-gestion-alert',
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
    MatSortModule
  ],
  templateUrl: './gestion-alert.component.html',
  styleUrl: './gestion-alert.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class GestionAlertComponent implements OnInit {
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
    // Simulación de carga de alertas
    setTimeout(() => {
      this.alertas = [
        { id: 1, nombreAlerta: 'Alerta de Alta Temperatura', descripcion: 'Temperatura crítica en Invernadero 1', tipoAlerta: 'Temperatura', prioridad: 'Alta', estado: 'Activa' },
        { id: 2, nombreAlerta: 'Alerta de Baja Humedad', descripcion: 'Humedad insuficiente en Campo Abierto 2', tipoAlerta: 'Humedad', prioridad: 'Media', estado: 'Inactiva' },
        { id: 3, nombreAlerta: 'Alerta de Falla de Luz', descripcion: 'Fallo en el sistema de iluminación Invernadero 3', tipoAlerta: 'Luz', prioridad: 'Baja', estado: 'Resuelta' },
        { id: 4, nombreAlerta: 'Alerta PH Alto', descripcion: 'Nivel de PH elevado en la zona de cultivo hidropónico', tipoAlerta: 'PH', prioridad: 'Alta', estado: 'Activa' },
        { id: 5, nombreAlerta: 'Alerta General de Riego', descripcion: 'Problemas con el sistema de riego central', tipoAlerta: 'General', prioridad: 'Media', estado: 'Inactiva' },
      ];
      this.dataSource.data = this.alertas;
      this.loading = false;
    }, 1000);
  }

  verAlerta(alerta: Alerta): void {
    this.alertaSeleccionada = alerta;
    this.cargarDatosAlerta();
    this.isEditing = false;
    this.alertaForm.disable();
  }

  editarAlerta(): void {
    this.isEditing = true;
    this.alertaForm.enable();
  }

  guardarAlerta(): void {
    if (this.alertaForm.valid && this.alertaSeleccionada) { // Check if alertaSeleccionada is not null
      // Simular la actualización de la alerta
      this.alertaSeleccionada = {
        ...this.alertaSeleccionada,
        nombreAlerta: this.alertaForm.value.nombreAlerta,
        descripcion: this.alertaForm.value.descripcion,
        tipoAlerta: this.alertaForm.value.tipoAlerta,
        prioridad: this.alertaForm.value.prioridad,
        estado: this.alertaForm.value.estado,
      };
      const index = this.alertas.findIndex(a => a.id === this.alertaSeleccionada!.id); // Use the non-null assertion here
      if (index > -1) {
        this.alertas[index] = this.alertaSeleccionada;
      }
      this.dataSource.data = this.alertas;
      this.snackBar.open('Alerta actualizada con éxito.', 'Cerrar', { duration: 3000 });
      this.isEditing = false;
      this.alertaForm.disable();
      this.cargarAlertas();
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'Cerrar', { duration: 3000 });
    }
  }

  eliminarAlerta(alerta: Alerta): void {
    if (confirm(`¿Está seguro de eliminar la alerta "${alerta.nombreAlerta}"?`)) {
      this.alertas = this.alertas.filter(a => a.id !== alerta.id);
      this.dataSource.data = this.alertas;
      this.alertaSeleccionada = null; // Limpiar la vista de detalle
      this.snackBar.open('Alerta eliminada con éxito.', 'Cerrar', { duration: 3000 });
    }
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
      });
    }
  }
}

