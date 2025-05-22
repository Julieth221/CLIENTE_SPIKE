import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider'; // Import MatDividerModule for the divider

// Define la interfaz SensorData aquí o impórtala desde un archivo compartido
interface SensorData {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  fechaRegistro: string;
  TipoSensor: string; // pH, Temperatura, Humedad, Luz, etc.
  Estado: string;
  FechaInstalacion: string;
  ID: number;
}

@Component({
  selector: 'app-card-sensor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule // Add MatDividerModule here
  ],
  templateUrl: './card-sensor.component.html',
  styleUrl: './card-sensor.component.css'
})
export class CardSensorComponent implements OnInit {
  @Input() sensores: SensorData[] = []; // Recibe el array de sensores
  @Output() verSensor = new EventEmitter<SensorData>();
  @Output() editarSensor = new EventEmitter<SensorData>();
  @Output() eliminarSensor = new EventEmitter<SensorData>();

  constructor() { }

  ngOnInit(): void { }

  onVerClick(sensor: SensorData): void {
    this.verSensor.emit(sensor);
  }

  onEditarClick(sensor: SensorData): void {
    this.editarSensor.emit(sensor);
  }

  onEliminarClick(sensor: SensorData): void {
    this.eliminarSensor.emit(sensor);
  }

  // Helper para obtener el color del estado
  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Activo':
        return '#4CAF50'; // Verde
      case 'Inactivo':
        return '#FFC107'; // Amarillo/Naranja
      case 'Resuelto':
        return '#2196F3'; // Azul
      default:
        return '#9E9E9E'; // Gris
    }
  }

  // Helper para obtener el icono del tipo de sensor
  getSensorTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'PH':
        return 'science'; // O 'water_drop'
      case 'Temperatura':
        return 'thermostat';
      case 'Humedad':
        return 'water_damage'; // O 'opacity'
      case 'Luz':
        return 'light_mode';
      default:
        return 'sensors'; // Icono por defecto
    }
  }

  // Helper para obtener el color de fondo para el tipo de sensor
  getSensorTypeBgColor(tipo: string): string {
    switch (tipo) {
      case 'PH':
        return '#9C27B0'; // Morado
      case 'Temperatura':
        return '#F44336'; // Rojo
      case 'Humedad':
        return '#2196F3'; // Azul
      case 'Luz':
        return '#FFEB3B'; // Amarillo
      default:
        return '#607D8B'; // Azul grisáceo
    }
  }
}
