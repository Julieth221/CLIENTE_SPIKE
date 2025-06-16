import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../../services/api.service';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { API_URLS } from '../../../../config/api_config';

interface SensorData {
  NombreTipoSensor: string;
  Descripcion: string;
  CultivoAsociado: string;
}

interface Cultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  Activo: boolean;
}

@Component({
  selector: 'app-registro-t-sensor',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './registro-t-sensor.component.html',
  styleUrl: './registro-t-sensor.component.css'
})
export class RegistroTSensorComponent implements OnInit {
  public showExitIcon = false;
  cultivos: Cultivo[] = [];
  selectedCultivo: number | null = null;
  loading = false;
  cultivoForm: FormGroup;

  sensorUsuario: any[] = [];

  loading: boolean = false;
  userId: number | null = null; // Cambiado a number para coincidir con getIdFromToken()
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private location: Location,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.cultivoForm = this.fb.group({
      cultivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener el userId directamente del token usando tu AuthService
    const id = this.authService.getIdFromToken();
    if (id !== 0) { // getIdFromToken devuelve 0 si no hay token o error
      this.userId = id;
      this.obtenerCultivosUsuario(); // Llama a la función para obtener cultivos una vez que el userId esté disponible
    } else {
      this.errorMessage = 'No se pudo obtener el ID de usuario del token. Por favor, inicie sesión.';
      console.warn('No se pudo obtener el ID de usuario del token para cargar los cultivos.');
      // Opcional: Redirigir al login si el usuario no está autenticado
      // this.router.navigate(['/login']);
    }

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        const previousUrl = event.urlAfterRedirects && event.urlAfterRedirects.length > 0
          ? event.urlAfterRedirects[event.urlAfterRedirects.length - 1]
          : event.url;

        this.showExitIcon = previousUrl !== '/dashboard/register-sensor';
      });

    this.cargarCultivos();
  }

  cargarCultivos(): void {
    this.loading = true;
    this.apiService.get<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo`).subscribe({
      next: (response: any) => {
        this.cultivos = response.Data.filter((cultivo: Cultivo) => cultivo.Activo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.snackBar.open('No fue posible cargar los cultivos. Por favor, intente nuevamente.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  goToComponent(sensorType: string) {
    if (!this.cultivoForm.valid) {
      this.snackBar.open('Por favor, selecciona un cultivo primero.', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const cultivoSeleccionado = this.cultivos.find(c => c.Id === this.cultivoForm.get('cultivo')?.value);
    if (!cultivoSeleccionado) {
      this.snackBar.open('Error al obtener el cultivo seleccionado.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    let sensorName = '';
    let sensorDescription = '';

    switch (sensorType) {
      case 'temperatura':
        sensorName = 'Temperatura';
        sensorDescription = 'Sensor para medir la temperatura del ambiente.';
        break;
      case 'humedad':
        sensorName = 'Humedad';
        sensorDescription = 'Sensor para medir la humedad del ambiente o del suelo.';
        break;
      case 'ph':
        sensorName = 'pH';
        sensorDescription = 'Sensor para medir la acidez o alcalinidad (pH) del suelo o agua.';
        break;
      default:
        console.error('Tipo de sensor desconocido:', sensorType);
        this.snackBar.open('Tipo de sensor desconocido o no soportado.', 'Cerrar', { duration: 3000 });
        return;
    }

    const data: SensorData = {
      NombreTipoSensor: sensorName,
      Descripcion: sensorDescription,
      CultivoAsociado: cultivoSeleccionado.Nombre,
    };

    this.router.navigate(['/dashboard/sensor/registro-sensor'], {
      state: { 
        sensorData: data,
        cultivoId: cultivoSeleccionado.Id
      },
    });
  }

  obtenerCultivosUsuario() {
    if (this.userId === null) { // Usar === null para verificar si no se ha establecido
      this.errorMessage = 'ID de usuario no disponible para cargar cultivos.';
      console.warn('obtenerCultivosUsuario: userId no está disponible.');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // La URL de la API se construye con el userId obtenido de tu AuthService
    this.apiService.get<SensorApiResponse>(`${API_URLS.CRUD.API_CRUD_SENSORES}/sensor?query=fk_usuario:${this.userId}`).subscribe({
      next: (response: SensorApiResponse) => {
        if (response && response.Data && Array.isArray(response.Data)) {
          this.sensorUsuario = response.Data;
          const uniqueCultivos = new Set<string>();
          this.sensorUsuario.forEach(sensor => {
            if (sensor.FkCultivo && sensor.FkCultivo.Nombre) {
              uniqueCultivos.add(sensor.FkCultivo.Nombre);
            }
          });
          this.cultivoOptions = Array.from(uniqueCultivos);
          this.loading = false;
        } else {
          this.errorMessage = 'No se pudieron cargar los cultivos o la respuesta no tiene el formato esperado.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los cultivos: ' + (error.message || error.statusText || JSON.stringify(error));
        console.error('Error al cargar los cultivos:', error);
        this.loading = false;
      }
    });
  }
}
