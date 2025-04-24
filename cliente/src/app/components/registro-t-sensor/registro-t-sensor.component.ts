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
import { Router } from '@angular/router';  // Importa el Router
import { ApiService } from '../../../services/api.service'; // Asegúrate de que la ruta al servicio sea correcta

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
    selector: 'app-registro-t-sensor',
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
    templateUrl: './registro-t-sensor.component.html',
    styleUrl: './registro-t-sensor.component.css',
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ]
})
export class RegistroTSensorComponent implements OnInit {
    sensorForm: FormGroup;
    ubicacion: string = '';
    latitud: number | null = null;
    longitud: number | null = null;
    cultivos: string[] = []; // Array para los nombres de los cultivos
    cultivoSeleccionado: string = '';
    sensorData: SensorData | null = null;
    private API_MID_SENSORES = 'http://localhost:8082/v1/sensores'; // Reemplaza con la URL real de tu API MID


    constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) {  // Inyecta el Router y ApiService
        this.sensorForm = this.fb.group({
            nombre: ['', Validators.required],
            ubicacion: ['', Validators.required],
            cultivo: ['', Validators.required], // Cambiado a 'cultivo'
            fecha: ['', Validators.required],
            // Otros campos del formulario
        });
    }

    ngOnInit(): void {
        // Inicializa la lista de cultivos (simulación de la base de datos)
        this.cultivos = ['Blanco', 'Azul', 'Cualquiera', 'Amarillo'];
        this.sensorData = history.state.sensorData; // Recibe los datos del componente anterior

        if (!this.sensorData) {
            // Manejar el caso donde no se recibieron datos.  Esto es importante
            // para evitar errores y para dar una mejor experiencia al usuario.
            console.error('No se recibieron datos del sensor.');
            alert('No se recibieron los datos del sensor. Por favor, vuelva a intentar el registro.');
            this.router.navigate(['/dashboard/register-sensor']); // Redirige a la página anterior
        }
    }

    // Función para obtener la geolocalización
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

  onSubmit() {
      if (this.sensorForm.valid && this.sensorData) {
        const formData = this.sensorForm.value;
        const dataToSend = {
          NombreTipoSensor: this.sensorData.NombreTipoSensor,
          Descripcion: this.sensorData.Descripcion,
          Nombre: formData.nombre,
          Ubicacion: formData.ubicacion,
          Cultivo: formData.cultivo, // Envía el nombre del cultivo
          FechaInstalacion: formData.fecha,
          Latitud: this.latitud,  // Envía latitud
          Longitud: this.longitud, // y longitud
          // ... otros campos del formulario
        };

        console.log('Datos a enviar al API MID:', dataToSend);

        this.apiService.post<any>(this.API_MID_SENSORES, dataToSend)
          .subscribe({
            next: (response: any) => {
              console.log('Respuesta del API MID:', response);
              // Redirige a donde sea necesario después del registro exitoso
              this.router.navigate(['/dashboard']); // Ajusta la ruta según tu necesidad
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
}

