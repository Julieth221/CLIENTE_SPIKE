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
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';

interface SensorData {
  NombreTipoSensor: string;
  Descripcion: string;
  CultivoAsociado: string;
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
    MatSnackBarModule
  ],
  templateUrl: './registro-t-sensor.component.html',
  styleUrl: './registro-t-sensor.component.css'
})
export class RegistroTSensorComponent implements OnInit {
  // Conexión al API MID de sensores
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores'; // Reincorporado

  public showExitIcon = false;

  cultivoOptions: string[] = ['Maíz Dulce', 'Tomate Cherry', 'Lechuga Romana', 'Fresas', 'Papas'];
  selectedCultivo: string | null = null;

  sensorUsuario: any[]= [];

  loading: boolean = false;
  userId: number = 0;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService, // Se mantiene si se usa en otros métodos no mostrados
    private location: Location,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // La lógica de showExitIcon se mantiene si es necesaria para la navegación en tu app.
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
  }

  goToComponent(sensorType: string) {
    if (!this.selectedCultivo) {
      this.snackBar.open('Por favor, selecciona un cultivo primero.', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warn']
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
      CultivoAsociado: this.selectedCultivo,
    };

    this.router.navigate(['/dashboard/sensor/registro-sensor'], {
      state: { sensorData: data },
    });
  }

      obtenerFincasUsuario() {
        this.loading = true;
        this.errorMessage = '';
        
        this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo?query=fk_cultivo:${this.userId}`).subscribe({
          next: (response: any) => {
            if (response && response.Data && Array.isArray(response.Data)) {
              this.sensorUsuario = response.Data;
              this.loading = false;
            } else {
              this.errorMessage = 'No se pudieron cargar los cultivos';
              this.loading = false;
            }
          },
          error: (error) => {
            this.errorMessage = 'Error al cargar los cultivos';
            console.error('Error:', error);
            this.loading = false;
          }
        });
      }
}
