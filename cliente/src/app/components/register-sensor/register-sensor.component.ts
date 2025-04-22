import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../services/api.service'; // Asegúrate de que la ruta al servicio sea correcta

@Component({
  selector: 'app-register-sensor',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    RouterModule,
    HttpClientModule,
  ],
  templateUrl: './register-sensor.component.html',
  styleUrl: './register-sensor.component.css',
})
export class RegisterSensorComponent implements OnInit {
  private API_MID_SENSORES = 'http://localhost:8082/v1/sensores'; // Reemplaza con la URL real de tu API MID

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    this.API_MID_SENSORES = 'http://localhost:8082/v1/sensores';
  }

  // Función para enviar los datos al API MID y luego navegar
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

    const data = {
      NombreTipoSensor: sensorName, // Ajusta los nombres de los campos según tu API MID
      Descripcion: sensorDescription, // Ajusta los nombres de los campos según tu API MID
    };

    // Envia los datos al API MID usando el servicio ApiService
    this.apiService.post<any>(this.API_MID_SENSORES, data)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del API MID:', response);
          // Redirige al componente registro-t-sensor
          this.router.navigate(['registro-t-sensor']); // Asegura que la ruta esté anidada dentro de dashboard
        },
        error: (error: any) => {
          console.error('Error al enviar datos al API MID:', error);
          alert('Error al registrar el sensor. Por favor, inténtalo de nuevo.');
        }
      });
  }
}

