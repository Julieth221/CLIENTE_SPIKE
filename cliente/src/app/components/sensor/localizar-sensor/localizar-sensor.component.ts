import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MapsSensorComponent } from '../maps-sensor/maps-sensor.component'; // Importa tu componente de mapa con el nombre correcto
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips en botones
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para spinner de carga
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Importa MatSnackBarModule y MatSnackBar
import { Location } from '@angular/common';

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
  nombreCultivo: string; // Nombre del cultivo asociado
}

@Component({
  selector: 'app-localizar-sensor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MapsSensorComponent, // Asegúrate de importar el MapsSensorComponent
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule // Añade MatSnackBarModule aquí
  ],
  templateUrl: './localizar-sensor.component.html',
  styleUrl: './localizar-sensor.component.css'
})
export class LocalizarSensorComponent implements OnInit, AfterViewInit {

  @ViewChild(MapsSensorComponent) mapComponent!: MapsSensorComponent; // Referencia al componente de mapa

  sensores: SensorData[] = [];
  filteredSensors: SensorData[] = [];
  searchText: string = '';
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private snackBar: MatSnackBar,
    private location: Location
  ) { } // Inyecta MatSnackBar

  ngOnInit(): void {
    this.cargarSensores();
  }

  ngAfterViewInit(): void {
    // No es necesario hacer nada aquí si el mapa se inicializa sin marcador
    // y solo se actualiza al hacer clic en un sensor.
  }

  cargarSensores(): void {
    this.loading = true;
    // Datos quemados de ejemplo para los sensores
    setTimeout(() => {
      this.sensores = [
        { id: 1, nombre: 'Sensor PH Invernadero 1', ubicacion: 'Invernadero 1, Sección A', latitud: 4.6513, longitud: -74.0939, cultivo: 'Tomate', fechaRegistro: '2024-05-01', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-04-20', ID: 101, nombreCultivo: 'Tomate Cherry' },
        { id: 2, nombre: 'Sensor Humedad Campo 2', ubicacion: 'Campo Abierto 2, Parcela B', latitud: 4.6000, longitud: -74.0700, cultivo: 'Maíz', fechaRegistro: '2024-05-05', TipoSensor: 'Humedad', Estado: 'Inactivo', FechaInstalacion: '2024-04-25', ID: 102, nombreCultivo: 'Maíz Dulce' },
        { id: 3, nombre: 'Sensor Temp Almacén', ubicacion: 'Almacén Principal', latitud: 4.6800, longitud: -74.1000, cultivo: 'Ninguno', fechaRegistro: '2024-05-10', TipoSensor: 'Temperatura', Estado: 'Activo', FechaInstalacion: '2024-05-01', ID: 103, nombreCultivo: 'Almacén' },
        { id: 4, nombre: 'Sensor PH Hidroponía', ubicacion: 'Nave Hidropónica 3', latitud: 4.6300, longitud: -74.0850, cultivo: 'Lechuga', fechaRegistro: '2024-05-15', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-05-05', ID: 104, nombreCultivo: 'Lechuga Romana' },
        { id: 5, nombre: 'Sensor Humedad Cultivo 1', ubicacion: 'Cultivo 1, Zona Este', latitud: 4.5900, longitud: -74.0600, cultivo: 'Fresa', fechaRegistro: '2024-05-20', TipoSensor: 'Humedad', Estado: 'Activo', FechaInstalacion: '2024-05-10', ID: 105, nombreCultivo: 'Fresas' },
        { id: 6, nombre: 'Sensor Temp Invernadero 2', ubicacion: 'Invernadero 2, Sección C', latitud: 4.6700, longitud: -74.0900, cultivo: 'Pimentón', fechaRegistro: '2024-05-25', TipoSensor: 'Temperatura', Estado: 'Inactivo', FechaInstalacion: '2024-05-15', ID: 106, nombreCultivo: 'Pimentón' },
      ];
      this.applyFilter(); // Aplicar filtro inicial para mostrar todos los sensores
      this.loading = false;
    }, 500);
  }

  applyFilter(): void {
    if (!this.searchText) {
      this.filteredSensors = [...this.sensores];
    } else {
      const lowerCaseSearchText = this.searchText.toLowerCase();
      this.filteredSensors = this.sensores.filter(sensor =>
        sensor.nombre.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.nombreCultivo.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.TipoSensor.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.ubicacion.toLowerCase().includes(lowerCaseSearchText)
      );
    }
  }

  verMapa(sensor: SensorData): void {
    if (this.mapComponent) {
      this.mapComponent.setMarker(sensor.latitud, sensor.longitud);
      // Opcional: centrar el mapa en el marcador
      this.mapComponent.center = { lat: sensor.latitud, lng: sensor.longitud };
      this.mapComponent.zoom = 15; // Un zoom más cercano para ver el detalle
    } else {
      this.snackBar.open('El componente de mapa no está disponible.', 'Cerrar', { duration: 3000 });
    }
  }
}
