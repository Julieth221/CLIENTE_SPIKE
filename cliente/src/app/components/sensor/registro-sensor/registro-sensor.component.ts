import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { AuthService } from '../../../../services/auth.service';
import { MapaSensorComponent } from '../mapa-sensor/mapa-sensor.component';

// Define custom date formats
const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface SensorTypeData {
  NombreTipoSensor: string;
  Descripcion: string;
}

interface GeolocalizacionParcela {
  lat_final: number;
  lat_inicial: number;
  lng_final: number;
  lng_inicial: number;
}

@Component({
  selector: 'app-registro-sensor',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MapaSensorComponent
  ],
  templateUrl: './registro-sensor.component.html',
  styleUrl: './registro-sensor.component.css',
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class RegistroSensorComponent implements OnInit, AfterViewInit {
  sensorForm: FormGroup;
  latitud: number | null = null;
  longitud: number | null = null;
  
  sensorData: SensorData | null = null;
  cultivoId: number | null = null;
  loading = false;
  geolocalizacionParcela: GeolocalizacionParcela | null = null;
  userId: number | null = null;

  // Datos quemados para las áreas de cultivo (deben coincidir con los de localizar-sensor)
  // cultivationAreas: CultivationArea[] = [
  //   {
  //     nombre: 'Tomate',
  //     ubicacion: 'Finca La Esperanza, Sector Norte',
  //     coordenadas: [
  //       { lat: 4.6500, lng: -74.0950 },
  //       { lat: 4.6500, lng: -74.0920 },
  //       { lat: 4.6530, lng: -74.0920 },
  //       { lat: 4.6530, lng: -74.0950 }
  //     ],
  //     tamano: 1.5
  //   },
  //   {
  //     nombre: 'Maíz',
  //     ubicacion: 'Hacienda El Roble, Zona Sur',
  //     coordenadas: [
  //       { lat: 4.5800, lng: -74.1200 },
  //       { lat: 4.5800, lng: -74.1100 },
  //       { lat: 4.5850, lng: -74.1100 },
  //       { lat: 4.5850, lng: -74.1200 }
  //     ],
  //     tamano: 2.3
  //   },
  //   {
  //     nombre: 'Lechuga',
  //     ubicacion: 'Granja Verde, Invernadero #3',
  //     coordenadas: [
  //       { lat: 4.6000, lng: -74.0800 },
  //       { lat: 4.6000, lng: -74.0780 },
  //       { lat: 4.6010, lng: -74.0780 },
  //       { lat: 4.6010, lng: -74.0800 }
  //     ],
  //     tamano: 0.8
  //   }
  // ];

  // selectedCultivationArea: CultivationArea | null = null;
  showMap: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private location: Location,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.sensorForm = this.fb.group({
      identificadorSensor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      fecha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const state = history.state;
    this.sensorData = state.sensorData;
    this.cultivoId = state.cultivoId;
    this.userId = this.authService.getUserId();

    if (!this.sensorData || !this.cultivoId) {
      this.snackBar.open('No se recibieron los datos necesarios. Por favor, vuelva a intentar el registro.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/dashboard/sensor/register-sensor']);
      return;
    }

    this.cargarGeolocalizacionParcela();
  }

  ngAfterViewInit(): void {
    // Inicialización adicional si es necesaria
  }

  cargarGeolocalizacionParcela(): void {
    this.loading = true;
    this.apiService.get<any>(`${API_URLS.MID.API_MID_SPIKE}/sensores/geolocalizacionParcela/${this.cultivoId}`).subscribe({
      next: (response: any) => {
        this.geolocalizacionParcela = response.geolocalizacionParcela;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar geolocalización:', error);
        this.snackBar.open('Error al cargar la geolocalización de la parcela.', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });

    // if (!this.isLocationValid) {
    //   this.snackBar.open('La ubicación seleccionada está fuera del área del cultivo. Por favor, selecciona un punto dentro del polígono.', 'Cerrar', {
    //     duration: 5000,
    //     panelClass: ['snackbar-warn']
    //   });
    // }
  }

  onUbicacionSeleccionada(coords: { lat: number, lng: number }): void {
    console.log('Ubicación seleccionada en registro-sensor:', coords);
    
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      this.latitud = coords.lat;
      this.longitud = coords.lng;
      console.log('Coordenadas actualizadas en registro-sensor:', { latitud: this.latitud, longitud: this.longitud });
    } else {
      console.error('Coordenadas inválidas recibidas:', coords);
      this.latitud = null;
      this.longitud = null;
    }
  }

  onSubmit(): void {
    if (this.sensorForm.valid && this.latitud !== null && this.longitud !== null && this.sensorData && this.cultivoId && this.userId) {
      const formData = this.sensorForm.value;
      
      // Formatear la fecha al formato requerido
      const fechaInstalacion = new Date(formData.fecha);
      const fechaFormateada = fechaInstalacion.toISOString();

      // Convertir el nombre del tipo de sensor a minúsculas
      const nombreTipoSensor = this.sensorData.NombreTipoSensor.toLowerCase();

      const dataToSend = {
        NombreTipoSensor: nombreTipoSensor,
        FechaInstalacion: fechaFormateada,
        Latitud: this.latitud,
        Longitud: this.longitud,
        FkCultivo: this.cultivoId,
        FkUsuario: this.userId,
        IdentificadorSensor: formData.identificadorSensor
      };
      console.log("Datos a enviar: ", dataToSend);

      this.loading = true;
      this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/sensores/`, dataToSend).subscribe({
        next: (response) => {
          this.snackBar.open('Sensor registrado exitosamente.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard/sensor/gestion-sensores']);
        },
        error: (error) => {
          console.error('Error al registrar sensor:', error);
          this.snackBar.open('Error al registrar el sensor. Por favor, intente nuevamente.', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Por favor, complete todos los campos correctamente y seleccione una ubicación válida.', 'Cerrar', { duration: 3000 });
    }
  }

  onExit(): void {
    this.location.back();
  }
}
