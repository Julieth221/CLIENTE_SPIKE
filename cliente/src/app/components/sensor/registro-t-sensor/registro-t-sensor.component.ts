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

interface SensorData {
  NombreTipoSensor: string;
  Descripcion: string;
}

@Component({
  selector: 'app-registro-t-sensor',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
  ],
  templateUrl: './registro-t-sensor.component.html',
  styleUrl: './registro-t-sensor.component.css'
})
export class RegistroTSensorComponent implements OnInit {
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores';
  public showExitIcon = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.API_MID_SENSORES = 'http://localhost:8082/v1/sensores';
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        // Comprueba si el componente se cargó como resultado de una navegación desde una ruta diferente a '/dashboard'
        const previousUrl = event.urlAfterRedirects && event.urlAfterRedirects.length > 0
          ? event.urlAfterRedirects[event.urlAfterRedirects.length - 1]
          : event.url;

        this.showExitIcon = previousUrl !== '/dashboard/register-sensor';
      });
  }


  goToComponent(sensorType: string) {
    let sensorName = '';
    let sensorDescription = '';

    switch (sensorType) {
      case 'temperatura':
        sensorName = 'Temperatura';
        sensorDescription = 'Sensor para medir la temperatura del ambiente.';
        break;
      case 'humedad':
        sensorName = 'Humedad';
        sensorDescription = 'Sensor para medir la humedad del ambiente.';
        break;
      case 'ph':
        sensorName = 'pH';
        sensorDescription = 'Sensor para medir el pH del suelo/agua.';
        break;
      default:
        console.error('Tipo de sensor desconocido:', sensorType);
        return;
    }

    const data: SensorData = {
      NombreTipoSensor: sensorName,
      Descripcion: sensorDescription,
    };

    this.router.navigate(['/dashboard/registro-t-sensor'], {
      state: { sensorData: data },
    });
  }

  onExit() {
    this.location.back();
  }
}
