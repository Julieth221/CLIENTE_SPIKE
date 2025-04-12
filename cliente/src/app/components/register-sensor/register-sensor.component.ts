import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importa HttpClient

@Component({
    selector: 'app-register-sensor',
    standalone: true,
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        RouterModule,
        HttpClientModule // Asegúrate de importar HttpClientModule
    ],
    templateUrl: './register-sensor.component.html',
    styleUrl: './register-sensor.component.css'
})
export class RegisterSensorComponent {

    private apiUrl = 'URL_DEL_API_MID'; // Reemplaza con la URL real de tu API

    constructor(private router: Router, private http: HttpClient) { } // Inyecta HttpClient

    // Función para enviar los datos al API y luego navegar
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
                return; // Detiene la ejecución si el tipo de sensor no es válido
        }

        const data = {
            nombre: sensorName,
            descripcion: sensorDescription,
        };

        // Envia los datos al API MID
        this.http.post(this.apiUrl, data)
            .subscribe({
                next: (response: any) => {
                    console.log('Respuesta del API:', response);
                    // Redirige al componente registro-t-sensor
                    this.router.navigate(['/registro-t-sensor']);
                },
                error: (error: any) => {
                    console.error('Error al enviar datos al API:', error);
                    alert('Error al registrar el sensor. Por favor, inténtalo de nuevo.');
                }
            });
    }
}
