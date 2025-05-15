import { Component, OnInit } from '@angular/core';
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

// Define custom date formats
const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMgetFullYear()',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMMgetFullYear()',
  },
};

interface SensorData {
  NombreTipoSensor: string;
  Descripcion: string;
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
  ],
  templateUrl: './registro-sensor.component.html',
  styleUrl: './registro-sensor.component.css',
  providers: [
      { provide: DateAdapter, useClass: NativeDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ]
})
export class RegistroSensorComponent implements OnInit {
  sensorForm: FormGroup;
  ubicacion: string = '';
  latitud: number | null = null;
  longitud: number | null = null;
  cultivos: string[] = [];
  cultivoSeleccionado: string = '';
  sensorData: SensorData | null = null;
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private location: Location,
  ) {
    this.sensorForm = this.fb.group({
      nombre: ['', Validators.required],
      ubicacion: ['', Validators.required],
      cultivo: [''],
      fecha: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cultivos = ['Blanco', 'Azul', 'Cualquiera', 'Amarillo'];
    this.sensorData = history.state.sensorData;
    console.log('Este es el tipo de sensor a registrar:', this.sensorData);

    if (!this.sensorData) {
      console.error('No se recibieron datos del sensor.');
      alert('No se recibieron los datos del sensor. Por favor, vuelva a intentar el registro.');
      this.router.navigate(['/dashboard/register-sensor']);
    }
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
        this.sensorForm.patchValue({
          ubicacion: `Lat: ${this.latitud}, Long: ${this.longitud}`,
        });
      }, (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener la ubicación. Por favor, asegúrate de que la geolocalización esté habilitada en tu navegador.');
      });
    } else {
      alert('Geolocalización no soportada por el navegador.');
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocurrió un error:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Algo salió mal; por favor, inténtalo de nuevo más tarde.');
  }

  onSubmit() {
    if (this.sensorForm.valid && this.sensorData) {
      const formData = this.sensorForm.value;
      const dataToSend = {
        NombreTipoSensor: this.sensorData.NombreTipoSensor,
        Descripcion: this.sensorData.Descripcion,
        Nombre: formData.nombre,
        Ubicacion: formData.ubicacion,
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
            alert('Sensor registrado exitosamente.');
          },
          error: (error: any) => {
            console.error('Error al enviar datos al API MID:', error);
            alert('Error al registrar el sensor. Por favor, inténtalo de nuevo.');
          },
        });
    } else {
      alert('Por favor, completa todos los campos del formulario correctamente.');
    }
  }

  onCultivoChange(event: any) {
    this.cultivoSeleccionado = event.value;
    this.sensorForm.get('cultivo')?.setValue(event.value);
  }

  onExit() {
    this.location.back();
  }
}

