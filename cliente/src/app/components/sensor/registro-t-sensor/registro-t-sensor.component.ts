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
  public showExitIcon = false;

  cultivoOptions: string[] = ['Maíz Dulce', 'Tomate Cherry', 'Lechuga Romana', 'Fresas', 'Papas'];
  selectedCultivo: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private location: Location,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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
}
