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
import { VerMapaComponent } from '../../finca/ver-mapa/ver-mapa.component';

// Interfaces para manejar la estructura de datos
interface SensorGeolocalizacion {
  Id: number;
  FkSensor: Sensor;
  FkGeolocalizacionSensor: Geolocalizacion;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
}

interface Sensor {
  Id: number;
  NombreSensor: string;
  FechaInstalacion: string;
  Activo: boolean;
  FkTipoSensor: any; // Ajustar el tipo si tienes una estructura para TipoSensor
}

interface Geolocalizacion {
  Id: number;
  Latitud: string;
  Longitud: string;
}

@Component({
  selector: 'app-versensor',
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
    VerMapaComponent
  ],
  providers: [DatePipe],
  templateUrl: './versensor.component.html',
  styleUrl: './versensor.component.css'
})
export class VersensorComponent implements OnInit {
  nombreSensor: string = '';
  sensorGeolocalizaciones: SensorGeolocalizacion[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VersensorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensorId: number, nombreSensor: string }
  ) { }

  ngOnInit(): void {
    if (!this.data?.sensorId) {
      this.errorMessage = 'No se proporcionó el ID del sensor';
      this.loading = false;
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      return;
    }

    this.nombreSensor = this.data.nombreSensor;
    this.cargarDatosSensorGeolocalizaciones();
  }

  cargarDatosSensorGeolocalizaciones(): void {
    this.loading = true;
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/SensorGeolocalizacion?query=FkSensor.Id:${this.data.sensorId}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.Data && Array.isArray(response.Data)) {
            this.sensorGeolocalizaciones = response.Data;
            this.loading = false;
          } else {
            this.errorMessage = 'No se encontraron datos de sensor geolocalización para este sensor.';
            this.loading = false;
            this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error al cargar datos de sensor geolocalización:', error);
          this.errorMessage = 'Error al cargar los datos.';
          this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getCoordenadas(geolocalizacion: Geolocalizacion): any {
    return {
      latitud: parseFloat(geolocalizacion.Latitud),
      longitud: parseFloat(geolocalizacion.Longitud),
    };
  }
}
