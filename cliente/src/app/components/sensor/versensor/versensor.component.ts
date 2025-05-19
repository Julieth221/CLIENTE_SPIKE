import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
// import { VerMapaComponent } from '../ver-mapa/ver-mapa.component';

// Interfaces para manejar la estructura de datos (ajustadas para Sensor)
interface Sensor {
  Id: number;
  nombre: string;
  ubicacion: string;
  TipoSensor: string;
  FechaInstalacion: string;
  // ... otras propiedades relevantes del sensor que podrías mostrar
}

@Component({
  selector: 'app-versensor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    // VerMapaComponent // Asegúrate de tener un componente de mapa si lo necesitas para la ubicación
  ],
  providers: [DatePipe],
  templateUrl: './versensor.component.html',
  styleUrl: './versensor.component.css'
})
export class VersensorComponent implements OnInit {
  // Datos del sensor
  nombreSensor: string = '';
  fechaInstalacion: string = '';
  sensor: Sensor | undefined;

  // Estado
  loading: boolean = true;
  errorMessage: string = '';

  // Datos quemados de sensores (de tu componente GestionSensores)
  sensoresQuemados: Sensor[] = [
    { Id: 101, nombre: 'Sensor PH Norte', ubicacion: 'Invernadero 1', TipoSensor: 'PH', FechaInstalacion: '2024-04-20' },
    { Id: 102, nombre: 'Sensor Humedad Sur', ubicacion: 'Campo Abierto A', TipoSensor: 'Humedad', FechaInstalacion: '2024-04-25' },
    { Id: 103, nombre: 'Sensor Temp Este', ubicacion: 'Invernadero 2', TipoSensor: 'Temperatura', FechaInstalacion: '2024-05-01' },
    { Id: 104, nombre: 'Sensor PH Oeste', ubicacion: 'Campo Abierto B', TipoSensor: 'PH', FechaInstalacion: '2024-05-05' },
    { Id: 105, nombre: 'Sensor Luz Central', ubicacion: 'Invernadero 1', TipoSensor: 'Luz', FechaInstalacion: '2024-05-10' },
    { Id: 106, nombre: 'Sensor Humedad Norte', ubicacion: 'Campo Abierto A', TipoSensor: 'Humedad', FechaInstalacion: '2024-05-15' },
  ];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VersensorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensorId: number, nombreSensor: string, FechaInstalacion: string }
  ) { }

  ngOnInit(): void {
    if (!this.data?.sensorId) {
      this.errorMessage = 'No se proporcionó el ID del sensor';
      this.loading = false;
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      return;
    }

    this.nombreSensor = this.data.nombreSensor;
    this.fechaInstalacion = this.data.FechaInstalacion;
    this.cargarDatosSensorQuemado();
  }

  cargarDatosSensorQuemado(): void {
    this.loading = true;
    this.sensor = this.sensoresQuemados.find(sensor => sensor.Id === this.data.sensorId);

    if (this.sensor) {
      this.loading = false;
    } else {
      this.errorMessage = 'No se encontró el sensor con el ID proporcionado.';
      this.loading = false;
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}