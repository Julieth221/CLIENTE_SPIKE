import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { ModalMapaSensorComponent } from '../modal-mapa-sensor/modal-mapa-sensor.component';


interface RegistroCultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  AreaSembrada: number;
  Activo: boolean;
}

interface SensorData {
  idSensor: number;
  identificadorSensor: string;
  tipo_sensor: string;
  estado: string;
  ubicacionSensor: {
    lat: number;
    lng: number;
  };
}

interface GeolocalizacionParcela {
  lat_final: number;
  lat_inicial: number;
  lng_final: number;
  lng_inicial: number;
}

interface RespuestaSensores {
  geolocalizacionParcela: GeolocalizacionParcela;
  nombreParcela: string;
  sensors: SensorData[];
}

@Component({
  selector: 'app-localizar-sensor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './localizar-sensor.component.html',
  styleUrl: './localizar-sensor.component.css'
})
export class LocalizarSensorComponent implements OnInit {
  cultivos: RegistroCultivo[] = [];
  cultivoSeleccionado: number | null = null;
  sensores: SensorData[] = [];
  filteredSensors: SensorData[] = [];
  searchText: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  nombreParcela: string = '';
  geolocalizacionParcela: GeolocalizacionParcela | null = null;
  user_id: number | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private location: Location,
    private apiService: ApiService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    if (this.user_id) {
      this.cargarCultivos();
    }
  }

  cargarCultivos(): void {
    this.loading = true;
    this.apiService.get<RegistroCultivo[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.cultivos = response.Data.filter((cultivo: RegistroCultivo) => cultivo.Activo);
        this.loading = false;
        if (this.cultivos.length === 0) {
          this.errorMessage = 'No hay cultivos disponibles';
        }
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.loading = false;
        this.errorMessage = 'Error al cargar los cultivos';
      }
    });
  }

  onCultivoSeleccionado(cultivoId: number): void {
    this.cultivoSeleccionado = cultivoId;
    this.cargarSensoresPorCultivo(cultivoId);
  }

  cargarSensoresPorCultivo(cultivoId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.sensores = [];
    this.filteredSensors = [];

    this.apiService.get<RespuestaSensores>(`${API_URLS.MID.API_MID_SPIKE}/sensores/geolocalizacionParcela/${cultivoId}`).subscribe({
      next: (response: any) => {
        if (response.sensors && response.sensors.length > 0) {
          this.sensores = response.sensors;
          this.filteredSensors = [...this.sensores];
          this.nombreParcela = response.nombreParcela;
          this.geolocalizacionParcela = response.geolocalizacionParcela;
        } else {
          this.errorMessage = 'Este cultivo no tiene sensores registrados';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar sensores:', error);
        this.loading = false;
        this.errorMessage = 'Error al cargar datos de geolocalización';
      }
    });
  }

  /**
   * Aplica el filtro de búsqueda y el filtro por cultivo a la lista de sensores.
   */
  // applyFilter(): void {
  //   let tempSensors = [...this.sensores];

  //   // Filtrar por cultivo
  //   if (this.cultivoSeleccionado && this.cultivoSeleccionado !== 'Todos los Cultivos') {
  //     tempSensors = tempSensors.filter(sensor => sensor.cultivo === this.cultivoSeleccionado);
  //   }

  //   // Filtrar por texto de búsqueda
  //   if (this.searchText) {
  //     const lowerCaseSearchText = this.searchText.toLowerCase();
  //     this.filteredSensors = this.sensores.filter(sensor =>
  //       sensor.identificadorSensor.toLowerCase().includes(lowerCaseSearchText) ||
  //       sensor.tipo_sensor.toLowerCase().includes(lowerCaseSearchText) ||
  //       this.nombreParcela.toLowerCase().includes(lowerCaseSearchText)
  //     );
  //   }
  //   this.filteredSensors = tempSensors;
  //   this.updateMapForSelectedCultivo(); // Actualizar el mapa cada vez que se filtra
  // }

  verMapa(sensor: SensorData): void {
    if (!this.geolocalizacionParcela) {
      this.snackBar.open('No hay datos de geolocalización disponibles', 'Cerrar', { duration: 3000 });
      return;
    }

    this.dialog.open(ModalMapaSensorComponent, {
      data: {
        geolocalizacionParcela: this.geolocalizacionParcela,
        ubicacionSensor: sensor.ubicacionSensor,
        identificadorSensor: sensor.identificadorSensor,
        nombreParcela: this.nombreParcela
      },
      width: '80%',
      maxWidth: '1200px',
      height: '80vh'
    });
  }
}
