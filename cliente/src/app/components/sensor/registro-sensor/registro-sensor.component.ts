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
// import { MapsSensorComponent } from '../maps-sensor/maps-sensor.component'; // Import MapsSensorComponent
// import { VerMapaComponent } from '../../finca/ver-mapa/ver-mapa.component'; // Comentado, usaremos MapsSensorComponent
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { MatDividerModule } from '@angular/material/divider';

// Define custom date formats
const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY', // Corregido el formato a uno estándar
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY', // Corregido el formato a uno estándar
  },
};
// Prueba

interface SensorTypeData {
  NombreTipoSensor: string;
  Descripcion: string;

}

interface CultivationArea {
  nombre: string;
  ubicacion: string;
  coordenadas: google.maps.LatLngLiteral[];
  tamano: number;
}

@Component({
  selector: 'app-registro-sensor',
  standalone: true, // Asegurarse de que sea standalone
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
    // MapsSensorComponent, // Añadido MapsSensorComponent a los imports
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
  sensorTypeData: SensorTypeData | null = null;
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores';
  isLocationValid: boolean = false; // Nuevo estado para la validación de la ubicación

  // Referencia al componente del mapa hijo
  // @ViewChild(MapsSensorComponent) mapsSensorComponent!: MapsSensorComponent;

  // Datos quemados para las áreas de cultivo (deben coincidir con los de localizar-sensor)
  cultivationAreas: CultivationArea[] = [
    {
      nombre: 'Tomate',
      ubicacion: 'Finca La Esperanza, Sector Norte',
      coordenadas: [
        { lat: 4.6500, lng: -74.0950 },
        { lat: 4.6500, lng: -74.0920 },
        { lat: 4.6530, lng: -74.0920 },
        { lat: 4.6530, lng: -74.0950 }
      ],
      tamano: 1.5
    },
    {
      nombre: 'Maíz',
      ubicacion: 'Hacienda El Roble, Zona Sur',
      coordenadas: [
        { lat: 4.5800, lng: -74.1200 },
        { lat: 4.5800, lng: -74.1100 },
        { lat: 4.5850, lng: -74.1100 },
        { lat: 4.5850, lng: -74.1200 }
      ],
      tamano: 2.3
    },
    {
      nombre: 'Lechuga',
      ubicacion: 'Granja Verde, Invernadero #3',
      coordenadas: [
        { lat: 4.6000, lng: -74.0800 },
        { lat: 4.6000, lng: -74.0780 },
        { lat: 4.6010, lng: -74.0780 },
        { lat: 4.6010, lng: -74.0800 }
      ],
      tamano: 0.8
    }
  ];

  selectedCultivationArea: CultivationArea | null = null;
  showMap: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    this.sensorForm = this.fb.group({
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required], // This will store the Lat/Long string
      cultivo: ['', Validators.required],
      fecha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.sensorTypeData = history.state.sensorData;

    if (!this.sensorTypeData) {
      this.snackBar.open('No se recibieron los datos del sensor. Por favor, vuelva a intentar el registro.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/dashboard/sensor/registro-t-sensor']);
    }
  }

  ngAfterViewInit(): void {
    // Asegurarse de que el mapa permita colocar marcadores por clic en esta vista
    // Se activa solo si el mapa ya está visible
    // Se usa un setTimeout para asegurar que el ViewChild esté completamente inicializado
    setTimeout(() => {
      // if (this.mapsSensorComponent && this.showMap) {
      //   this.mapsSensorComponent.enableMapClickPlacement = true;
      // }
    });
  }

  // Este método será llamado por MapsSensorComponent cuando se seleccione/arrastre un punto
  onMapGeolocalizacionChange(geoPoint: { Latitud: string, Longitud: string, isValid: boolean }) {
    this.latitud = parseFloat(geoPoint.Latitud);
    this.longitud = parseFloat(geoPoint.Longitud);
    this.isLocationValid = geoPoint.isValid; // Usar el estado de validez emitido por el mapa

    this.sensorForm.patchValue({
      ubicacion: `Lat: ${this.latitud}, Long: ${this.longitud}`,
    });

    if (!this.isLocationValid) {
      this.snackBar.open('La ubicación seleccionada está fuera del área del cultivo. Por favor, selecciona un punto dentro del polígono.', 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-warn']
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      console.error('Ocurrió un error:', error.error.message);
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
      errorMessage = `Error del servidor (${error.status}): ${JSON.stringify(error.error)}`;
    }
    this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
    return throwError(() => new Error(errorMessage));
  }

  onSubmit() {
    // Asegurarse de que la ubicación sea válida antes de enviar
    if (this.selectedCultivationArea && !this.isLocationValid) {
      this.snackBar.open('La ubicación seleccionada está fuera del área del cultivo. Por favor, selecciona un punto válido.', 'Cerrar', {
        duration: 5000,
        panelClass: ['snackbar-warn']
      });
      return; // Detener el envío del formulario
    }

    if (this.sensorForm.valid && this.sensorTypeData && this.latitud !== null && this.longitud !== null && this.isLocationValid) {
      const formData = this.sensorForm.value;
      const dataToSend = {
        NombreTipoSensor: this.sensorTypeData.NombreTipoSensor,
        Descripcion: this.sensorTypeData.Descripcion,
        Nombre: formData.nombre,
        Ubicacion: formData.ubicacion, // This will be the Lat/Long string
        Cultivo: formData.cultivo,
        FechaInstalacion: formData.fecha,
        Latitud: this.latitud,
        Longitud: this.longitud,
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      this.http.post<any>(this.API_MID_SENSORES, dataToSend, { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
        .subscribe({
          next: (response: any) => {
            this.router.navigate(['/dashboard/sensor/gestion-sensores']);
            this.snackBar.open('Sensor registrado exitosamente.', 'Cerrar', { duration: 3000 });
          },
          error: (error: any) => {
            this.snackBar.open('Error al registrar el sensor. Por favor, inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
          },
        });
    } else {
      this.snackBar.open('Por favor, completa todos los campos del formulario correctamente y selecciona una ubicación válida en el mapa.', 'Cerrar', { duration: 5000 });
    }
  }

  onCultivoSelectChange(event: any) {
    const selectedCultivoNombre = event.value;
    this.selectedCultivationArea = this.cultivationAreas.find(c => c.nombre === selectedCultivoNombre) || null;

    if (this.selectedCultivationArea) {
      this.showMap = true;
      // Asegurarse de que mapsSensorComponent esté disponible antes de usarlo
      // Usar un setTimeout para asegurar que el ViewChild esté completamente inicializado
      setTimeout(() => {
        // if (this.mapsSensorComponent) {
        //   this.mapsSensorComponent.cultivationPolygonCoords = this.selectedCultivationArea!.coordenadas; // ! para asegurar que no es null
        //   this.mapsSensorComponent.clearAllMarkers();
        //   // Centrar el mapa en el polígono del cultivo seleccionado
        //   if (this.mapsSensorComponent.map && this.mapsSensorComponent.map.googleMap) {
        //     const bounds = new google.maps.LatLngBounds();
        //     this.selectedCultivationArea!.coordenadas.forEach(coord => bounds.extend(coord)); // ! para asegurar que no es null
        //     this.mapsSensorComponent.map.googleMap.fitBounds(bounds);
        //   }
        //   this.mapsSensorComponent.enableMapClickPlacement = true; // Habilitar la colocación de marcadores al seleccionar cultivo
        // }
      });
    } else {
      this.showMap = false;
      setTimeout(() => { // Usar setTimeout también para resetear
        // if (this.mapsSensorComponent) {
        //   this.mapsSensorComponent.resetMap();
        //   this.mapsSensorComponent.cultivationPolygonCoords = null;
        //   this.mapsSensorComponent.enableMapClickPlacement = false; // Deshabilitar si no hay cultivo
        // }
      });
    }
    this.sensorForm.get('ubicacion')?.setValue('');
    this.latitud = null;
    this.longitud = null;
    this.isLocationValid = false;
  }

  setMarkerFromInput(): void {
    const ubicacionString = this.sensorForm.get('ubicacion')?.value;
    if (!ubicacionString) {
      this.snackBar.open('Por favor, ingresa las coordenadas en el campo de ubicación.', 'Cerrar', { duration: 3000 });
      return;
    }

    const parts = ubicacionString.split(',').map((s: string) => s.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].replace('Lat:', ''));
      const lng = parseFloat(parts[1].replace('Long:', ''));

      if (!isNaN(lat) && !isNaN(lng)) {
        // if (this.mapsSensorComponent) {
        //   this.mapsSensorComponent.addSingleSensorMarker(lat, lng);
        // } 
        // else {
        //   this.snackBar.open('El componente del mapa no está disponible.', 'Cerrar', { duration: 3000 });
        // }
      } else {
        this.snackBar.open('Formato de coordenadas inválido. Usa "Lat: X.XXXXXX, Long: Y.YYYYYY".', 'Cerrar', { duration: 5000 });
      }
    } else {
      this.snackBar.open('Formato de coordenadas inválido. Usa "Lat: X.XXXXXX, Long: Y.YYYYYY".', 'Cerrar', { duration: 5000 });
    }
  }

  onExit() {
    this.router.navigate(['/dashboard/sensor/registro-t-sensor'], {
      state: { sensorData: this.sensorTypeData }
    });
  }
}
