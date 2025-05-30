import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBarModule
import { MatTooltipModule } from '@angular/material/tooltip'; // Import MatTooltipModule

// Interfaz para simular los datos del sensor de la DB
interface Sensor {
  id: number;
  nombre: string;
  tipo_sensor: 'Temperatura' | 'Humedad' | 'Luz' | 'PH';
  unidad_medida: string;
  valor_min: number;
  valor_max: number;
  ubicacion: string;
  cultivo: string; // Añadido el campo cultivo
}

@Component({
  selector: 'app-probar-sensor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatDividerModule,
    MatSnackBarModule, // Añadido al imports
    MatTooltipModule // Añadido al imports
  ],
  templateUrl: './probar-sensor.component.html',
  styleUrl: './probar-sensor.component.css'
})
export class ProbarSensorComponent implements OnInit, OnDestroy {

  // Lista de sensores simulados (basada en tu tabla 'sensores')
  allSensors: Sensor[] = [ // Renombrado a allSensors para diferenciar del filtrado
    { id: 1, nombre: 'Sensor Temp Invernadero 1', tipo_sensor: 'Temperatura', unidad_medida: '°C', valor_min: 15, valor_max: 30, ubicacion: 'Invernadero A', cultivo: 'Tomate Cherry' },
    { id: 2, nombre: 'Sensor Humedad Campo B', tipo_sensor: 'Humedad', unidad_medida: '%', valor_min: 40, valor_max: 80, ubicacion: 'Campo Abierto B', cultivo: 'Maíz Dulce' },
    { id: 3, nombre: 'Sensor Luz Hidropónico C', tipo_sensor: 'Luz', unidad_medida: 'Lux', valor_min: 5000, valor_max: 15000, ubicacion: 'Sistema Hidropónico C', cultivo: 'Lechuga Romana' },
    { id: 4, nombre: 'Sensor PH Estanque D', tipo_sensor: 'PH', unidad_medida: 'pH', valor_min: 5.5, valor_max: 7.5, ubicacion: 'Estanque Riego D', cultivo: 'Fresas' },
    { id: 5, nombre: 'Sensor Temp Suelo E', tipo_sensor: 'Temperatura', unidad_medida: '°C', valor_min: 10, valor_max: 25, ubicacion: 'Parcela Experimental E', cultivo: 'Tomate Cherry' },
    { id: 6, nombre: 'Sensor Humedad Invernadero 2', tipo_sensor: 'Humedad', unidad_medida: '%', valor_min: 50, valor_max: 90, ubicacion: 'Invernadero B', cultivo: 'Fresas' },
    { id: 7, nombre: 'Sensor Luz Campo F', tipo_sensor: 'Luz', unidad_medida: 'Lux', valor_min: 3000, valor_max: 10000, ubicacion: 'Campo Abierto F', cultivo: 'Maíz Dulce' },
  ];

  cultivoOptions: string[] = [];
  selectedCultivo: string | null = null; // Nuevo para el filtro de cultivo

  availableSensors: Sensor[] = []; // Sensores filtrados por cultivo
  selectedSensorId: number | null = null;
  selectedSensor: Sensor | null = null;

  currentReading: number | null = null;
  sensorStatus: 'ok' | 'anomalo' | 'sin_datos' | 'detenido' = 'detenido';
  statusMessage: string = 'Selecciona un sensor para iniciar la prueba.';

  private testInterval: any;
  private dataReceptionTimeout: any;
  private lastReadingTimestamp: number = 0; // Para detectar si los datos se detienen

  constructor(private location: Location, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.populateCultivoOptions();
    this.filterSensorsByCultivo(); // Llamar al inicio para inicializar availableSensors
  }

  ngOnDestroy(): void {
    this.stopTest(); // Asegurarse de limpiar el intervalo al destruir el componente
  }

  populateCultivoOptions(): void {
    this.cultivoOptions = [...new Set(this.allSensors.map(s => s.cultivo))].sort();
  }

  onCultivoSelected(): void {
    this.stopTest(); // Detener cualquier prueba en curso
    this.selectedSensorId = null; // Resetear la selección del sensor
    this.selectedSensor = null;
    this.filterSensorsByCultivo(); // Filtrar los sensores disponibles por el cultivo seleccionado
    this.statusMessage = 'Selecciona un sensor para iniciar la prueba.';
    this.sensorStatus = 'detenido';
    this.currentReading = null;
  }

  filterSensorsByCultivo(): void {
    if (this.selectedCultivo) {
      this.availableSensors = this.allSensors.filter(s => s.cultivo === this.selectedCultivo);
    } else {
      this.availableSensors = [...this.allSensors]; // Si no hay cultivo seleccionado, mostrar todos
    }
  }

  onSensorSelected(): void {
    this.stopTest(); // Detener cualquier prueba en curso
    this.selectedSensor = this.availableSensors.find(s => s.id === this.selectedSensorId) || null;
    if (this.selectedSensor) {
      this.statusMessage = `Sensor '${this.selectedSensor.nombre}' seleccionado. Listo para iniciar prueba.`;
      this.sensorStatus = 'detenido';
      this.currentReading = null;
    } else {
      this.statusMessage = 'Selecciona un sensor para iniciar la prueba.';
      this.sensorStatus = 'detenido';
      this.currentReading = null;
    }
  }

  startTest(): void {
    if (!this.selectedSensor) {
      this.snackBar.open('Por favor, selecciona un sensor primero.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.stopTest(); // Detener cualquier prueba anterior para evitar múltiples intervalos
    this.snackBar.open(`Iniciando prueba para '${this.selectedSensor.nombre}'...`, 'Cerrar', { duration: 2000 });

    this.sensorStatus = 'ok';
    this.statusMessage = 'Recibiendo datos...';
    this.lastReadingTimestamp = Date.now(); // Reset timestamp

    this.testInterval = setInterval(() => {
      this.generateAndCheckReading();
    }, 2000); // Genera una lectura cada 2 segundos

    // Configura un timeout para detectar "sin datos"
    this.dataReceptionTimeout = setTimeout(() => {
      this.checkDataReception();
    }, 5000); // Espera 5 segundos para la primera lectura o para detectar ausencia
  }

  stopTest(): void {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    if (this.dataReceptionTimeout) {
      clearTimeout(this.dataReceptionTimeout);
      this.dataReceptionTimeout = null;
    }
    if (this.selectedSensor) {
      this.statusMessage = `Prueba detenida para '${this.selectedSensor.nombre}'.`;
      this.sensorStatus = 'detenido';
    } else {
      this.statusMessage = 'Prueba detenida.';
      this.sensorStatus = 'detenido';
    }
    this.currentReading = null;
  }

  private generateAndCheckReading(): void {
    if (!this.selectedSensor) return;

    this.lastReadingTimestamp = Date.now(); // Actualiza el timestamp con cada nueva lectura

    // Simular un fallo ocasional (sin datos)
    if (Math.random() < 0.05) { // 5% de probabilidad de simular una pausa
      this.currentReading = null;
      this.statusMessage = `¡Atención! Sin datos del sensor '${this.selectedSensor.nombre}'.`;
      this.sensorStatus = 'sin_datos';
      // No detiene la prueba, solo simula una interrupción temporal
      return;
    }

    let value: number;
    const { tipo_sensor, valor_min, valor_max } = this.selectedSensor;

    // Generar valor aleatorio dentro de un rango más amplio para simular variaciones
    const range = valor_max - valor_min;
    const buffer = range * 0.2; // 20% de buffer para valores fuera de rango

    // Generar valores que a veces sean anómalos
    if (Math.random() < 0.15) { // 15% de probabilidad de generar un valor anómalo
      value = Math.random() * (range + 2 * buffer) + (valor_min - buffer);
      // Asegurarse de que el valor sea claramente anómalo si la intención es esa
      if (Math.random() < 0.5) { // 50% de que sea por debajo del min
        value = valor_min - (Math.random() * buffer + 1);
      } else { // 50% de que sea por encima del max
        value = valor_max + (Math.random() * buffer + 1);
      }
    } else {
      // Valor normal dentro del rango esperado
      value = Math.random() * range + valor_min;
    }

    // Redondear para visualización
    if (tipo_sensor === 'PH') {
      this.currentReading = parseFloat(value.toFixed(1));
    } else {
      this.currentReading = Math.round(value);
    }

    this.checkSensorStatus();

    // Resetear el timeout de "sin datos" si se recibe una lectura
    if (this.dataReceptionTimeout) {
      clearTimeout(this.dataReceptionTimeout);
    }
    this.dataReceptionTimeout = setTimeout(() => {
      this.checkDataReception();
    }, 3000); // Si no hay nueva lectura en 3 segundos, asume "sin datos"
  }

  private checkSensorStatus(): void {
    if (!this.selectedSensor || this.currentReading === null) {
      this.sensorStatus = 'sin_datos';
      this.statusMessage = `No hay datos recibidos del sensor '${this.selectedSensor?.nombre || 'desconocido'}'.`;
      return;
    }

    const { valor_min, valor_max, nombre, tipo_sensor } = this.selectedSensor;

    if (this.currentReading >= valor_min && this.currentReading <= valor_max) {
      this.sensorStatus = 'ok';
      this.statusMessage = `Sensor '${nombre}' operando correctamente.`;
    } else {
      this.sensorStatus = 'anomalo';
      this.statusMessage = `¡Alerta! Datos anómalos de '${nombre}': ${this.currentReading} ${this.selectedSensor.unidad_medida}. Rango esperado: ${valor_min}-${valor_max} ${this.selectedSensor.unidad_medida}.`;
    }
  }

  private checkDataReception(): void {
    // Si la última lectura fue hace más de 3 segundos (nuestro intervalo + un buffer)
    // y la prueba está activa (intervalo existe)
    if (this.testInterval && (Date.now() - this.lastReadingTimestamp > 2500)) { // Un poco más que el intervalo de 2s
      this.sensorStatus = 'sin_datos';
      this.statusMessage = `¡Atención! No se han recibido datos del sensor '${this.selectedSensor?.nombre || 'desconocido'}' por un tiempo.`;
      this.snackBar.open(this.statusMessage, 'Cerrar', { duration: 5000, panelClass: ['snackbar-warn'] });
    }
  }

  // Helper para obtener el icono del tipo de sensor
  getSensorTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'PH':
        return 'science';
      case 'Temperatura':
        return 'thermostat';
      case 'Humedad':
        return 'water_drop';
      case 'Luz':
        return 'light_mode';
      default:
        return 'sensors';
    }
  }

}
