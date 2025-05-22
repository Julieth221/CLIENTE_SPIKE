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
import { MapsSensorComponent } from '../maps-sensor/maps-sensor.component'; // Import MapsSensorComponent
import { VerMapaComponent } from '../../finca/ver-mapa/ver-mapa.component';   // Import VerMapaComponent
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { MatDividerModule } from '@angular/material/divider';

// Define custom date formats
const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY', // Corrected format
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY', // Corrected format
  },
};

interface SensorData {
  NombreTipoSensor: string;
  Descripcion: string;
}

interface CultivationArea {
  nombre: string;
  ubicacion: string;
  coordenadas: {
    latitudInicial: number;
    longitudInicial: number;
    latitudFinal: number;
    longitudFinal: number;
  };
  tamano: number; // in hectares
}

@Component({
  selector: 'app-registro-sensor',
  standalone: true,
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
    MapsSensorComponent, // Add MapsSensorComponent to imports
    VerMapaComponent,    // Add VerMapaComponent to imports
    MatDividerModule,
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
  cultivos: string[] = [];
  cultivoSeleccionado: string = '';
  sensorData: SensorData | null = null;
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores';

  // Burned-in data for cultivation area
  cultivationArea: CultivationArea = {
    nombre: 'Parcela de Tomate',
    ubicacion: 'Finca La Esperanza, Sector Norte',
    coordenadas: {
      latitudInicial: 4.6500,
      longitudInicial: -74.0950,
      latitudFinal: 4.6530,
      longitudFinal: -74.0920
    },
    tamano: 1.5 // hectares
  };

  @ViewChild(MapsSensorComponent) mapsSensorComponent!: MapsSensorComponent;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {
    this.sensorForm = this.fb.group({
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required], // This will store the Lat/Long string
      cultivo: ['', Validators.required], // Made required as per common form practices
      fecha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cultivos = ['Tomate', 'Maíz', 'Lechuga', 'Fresa', 'Pimentón']; // More realistic examples
    this.sensorData = history.state.sensorData;
    console.log('Este es el tipo de sensor a registrar:', this.sensorData);

    if (!this.sensorData) {
      console.error('No se recibieron datos del sensor.');
      this.snackBar.open('No se recibieron los datos del sensor. Por favor, vuelva a intentar el registro.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/dashboard/sensor/register-sensor']); // Adjust this route as needed
    }
  }

  ngAfterViewInit(): void {
    // Optionally set initial map center if needed, or let MapsSensorComponent handle its default
  }

  // This method will be called by MapsSensorComponent when a point is selected/dragged
  onMapGeolocalizacionChange(geoPoint: { Latitud: string, Longitud: string }) {
    this.latitud = parseFloat(geoPoint.Latitud);
    this.longitud = parseFloat(geoPoint.Longitud);
    this.sensorForm.patchValue({
      ubicacion: `Lat: ${this.latitud}, Long: ${this.longitud}`,
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Ocurrió un error:', error.error.message);
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Backend error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
      errorMessage = `Error del servidor (${error.status}): ${JSON.stringify(error.error)}`;
    }
    this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
    return throwError(() => new Error(errorMessage));
  }

  onSubmit() {
    if (this.sensorForm.valid && this.sensorData && this.latitud !== null && this.longitud !== null) {
      const formData = this.sensorForm.value;
      const dataToSend = {
        NombreTipoSensor: this.sensorData.NombreTipoSensor,
        Descripcion: this.sensorData.Descripcion,
        Nombre: formData.nombre,
        Ubicacion: formData.ubicacion, // This will be the Lat/Long string
        Cultivo: formData.cultivo,
        FechaInstalacion: formData.fecha,
        Latitud: this.latitud,
        Longitud: this.longitud,
      };

      console.log('Datos a enviar al API MID:', dataToSend);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      this.http.post<any>(this.API_MID_SENSORES, dataToSend, { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
        .subscribe({
          next: (response: any) => {
            console.log('Respuesta del API MID:', response);
            this.router.navigate(['/dashboard/sensor/gestion-sensores']);
            this.snackBar.open('Sensor registrado exitosamente.', 'Cerrar', { duration: 3000 });
          },
          error: (error: any) => {
            console.error('Error al enviar datos al API MID:', error);
            this.snackBar.open('Error al registrar el sensor. Por favor, inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
          },
        });
    } else {
      this.snackBar.open('Por favor, completa todos los campos del formulario correctamente y selecciona una ubicación en el mapa.', 'Cerrar', { duration: 5000 });
    }
  }

  onCultivoChange(event: any) {
    this.cultivoSeleccionado = event.value;
    this.sensorForm.get('cultivo')?.setValue(event.value);
  }

  onExit() {
    // Navega de regreso al componente anterior, pasando sensorData en el estado
    // Asumiendo que el componente anterior es el que selecciona el tipo de sensor
    this.location.back(); // Esto es más directo para volver al estado anterior
  }
}
