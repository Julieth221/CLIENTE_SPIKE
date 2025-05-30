import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MapsSensorComponent } from '../maps-sensor/maps-sensor.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule

interface SensorData {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  fechaRegistro: string;
  TipoSensor: string;
  Estado: string;
  FechaInstalacion: string;
  ID: number;
}

interface CultivationArea {
  nombre: string;
  ubicacion: string;
  coordenadas: google.maps.LatLngLiteral[];
  tamano: number;
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
    MapsSensorComponent,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule // Add MatSelectModule here
  ],
  templateUrl: './localizar-sensor.component.html',
  styleUrl: './localizar-sensor.component.css'
})
export class LocalizarSensorComponent implements OnInit, AfterViewInit {

  @ViewChild(MapsSensorComponent) mapComponent!: MapsSensorComponent;

  sensores: SensorData[] = [];
  filteredSensors: SensorData[] = [];
  searchText: string = '';
  loading: boolean = true;
  errorMessage: string = '';

  // Datos quemados para las áreas de cultivo (deben coincidir con los de registro-sensor)
  cultivationAreas: CultivationArea[] = [
    {
      nombre: 'Tomate', // Simplificado para que coincida con el campo 'cultivo' de SensorData
      ubicacion: 'Finca La Esperanza, Sector Norte',
      coordenadas: [
        { lat: 4.6500, lng: -74.0950 },
        { lat: 4.6500, lng: -74.0920 },
        { lat: 4.6530, lng: -74.0920 },
        { lat: 4.6530, lng: -74.0950 }
      ],
      tamano: 1.5
    },
    {
      nombre: 'Maíz', // Simplificado
      ubicacion: 'Hacienda El Roble, Zona Sur',
      coordenadas: [
        { lat: 4.5800, lng: -74.1200 },
        { lat: 4.5800, lng: -74.1100 },
        { lat: 4.5850, lng: -74.1100 },
        { lat: 4.5850, lng: -74.1200 }
      ],
      tamano: 2.3
    },
    {
      nombre: 'Lechuga', // Simplificado
      ubicacion: 'Granja Verde, Invernadero #3',
      coordenadas: [
        { lat: 4.6000, lng: -74.0800 },
        { lat: 4.6000, lng: -74.0780 },
        { lat: 4.6010, lng: -74.0780 },
        { lat: 4.6010, lng: -74.0800 }
      ],
      tamano: 0.8
    },
    {
      nombre: 'Pimentón', // Añadido para los datos quemados de gestión_sensores
      ubicacion: 'Invernadero 2, Sección C',
      coordenadas: [
        { lat: 10.5650, lng: -75.1250 },
        { lat: 10.5650, lng: -75.1200 },
        { lat: 10.5700, lng: -75.1200 },
        { lat: 10.5700, lng: -75.1250 }
      ],
      tamano: 1.0
    },
    {
      nombre: 'Yuca', // Añadido
      ubicacion: 'Campo Abierto B, Lote 4',
      coordenadas: [
        { lat: 9.5400, lng: -76.2300 },
        { lat: 9.5400, lng: -76.2250 },
        { lat: 9.5450, lng: -76.2250 },
        { lat: 9.5450, lng: -76.2300 }
      ],
      tamano: 3.0
    },
    {
      nombre: 'Ninguno', // Para sensores sin cultivo específico
      ubicacion: 'Ubicación General',
      coordenadas: [], // Sin polígono definido
      tamano: 0
    }
  ];

  cultivoOptions: string[] = []; // Opciones para el select de cultivo
  selectedCultivo: string | null = null; // Cultivo seleccionado en el filtro

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.cargarSensores();
    this.populateCultivoOptions();
  }

  ngAfterViewInit(): void {
    // Asegurarse de que el mapa no permita colocar marcadores por clic en esta vista
    if (this.mapComponent) {
      this.mapComponent.enableMapClickPlacement = false;
    }
  }

  populateCultivoOptions(): void {
    this.cultivoOptions = [...new Set(this.cultivationAreas.map(c => c.nombre))].sort();
    this.cultivoOptions.unshift('Todos los Cultivos'); // Añadir opción "Todos"
  }

  cargarSensores(): void {
    this.loading = true;
    setTimeout(() => {
      this.sensores = [
        { id: 1, nombre: 'Sensor PH Invernadero 1', ubicacion: 'Invernadero 1, Sección A', latitud: 4.6513, longitud: -74.0939, cultivo: 'Tomate', fechaRegistro: '2024-05-01', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-04-20', ID: 101 },
        { id: 2, nombre: 'Sensor Humedad Campo 2', ubicacion: 'Campo Abierto 2, Parcela B', latitud: 4.5820, longitud: -74.1150, cultivo: 'Maíz', fechaRegistro: '2024-05-05', TipoSensor: 'Humedad', Estado: 'Inactivo', FechaInstalacion: '2024-04-25', ID: 102 },
        { id: 3, nombre: 'Sensor Temp Almacén', ubicacion: 'Almacén Principal', latitud: 4.6800, longitud: -74.1000, cultivo: 'Ninguno', fechaRegistro: '2024-05-10', TipoSensor: 'Temperatura', Estado: 'Activo', FechaInstalacion: '2024-05-01', ID: 103 },
        { id: 4, nombre: 'Sensor PH Hidroponía', ubicacion: 'Nave Hidropónica 3', latitud: 4.6005, longitud: -74.0790, cultivo: 'Lechuga', fechaRegistro: '2024-05-15', TipoSensor: 'PH', Estado: 'Activo', FechaInstalacion: '2024-05-05', ID: 104 },
        { id: 5, nombre: 'Sensor Temp Invernadero 2', ubicacion: 'Invernadero 2, Sección C', latitud: 10.5680, longitud: -75.1230, cultivo: 'Pimentón', fechaRegistro: '2024-05-20', TipoSensor: 'Temperatura', Estado: 'Activo', FechaInstalacion: '2024-05-10', ID: 105 },
        { id: 6, nombre: 'Sensor Humedad Campo B', ubicacion: 'Campo Abierto B, Lote 4', latitud: 9.5420, longitud: -76.2280, cultivo: 'Yuca', fechaRegistro: '2024-05-25', TipoSensor: 'Humedad', Estado: 'Activo', FechaInstalacion: '2024-05-15', ID: 106 },
      ];
      this.applyFilter();
      this.loading = false;
    }, 500);
  }

  /**
   * Aplica el filtro de búsqueda y el filtro por cultivo a la lista de sensores.
   */
  applyFilter(): void {
    let tempSensors = [...this.sensores];

    // Filtrar por cultivo
    if (this.selectedCultivo && this.selectedCultivo !== 'Todos los Cultivos') {
      tempSensors = tempSensors.filter(sensor => sensor.cultivo === this.selectedCultivo);
    }

    // Filtrar por texto de búsqueda
    if (this.searchText) {
      const lowerCaseSearchText = this.searchText.toLowerCase();
      tempSensors = tempSensors.filter(sensor =>
        sensor.nombre.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.cultivo.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.TipoSensor.toLowerCase().includes(lowerCaseSearchText) ||
        sensor.ubicacion.toLowerCase().includes(lowerCaseSearchText)
      );
    }
    this.filteredSensors = tempSensors;
    this.updateMapForSelectedCultivo(); // Actualizar el mapa cada vez que se filtra
  }

  /**
   * Se llama cuando se selecciona un cultivo del dropdown.
   */
  onCultivoSelected(): void {
    this.searchText = ''; // Limpiar búsqueda al cambiar de cultivo
    this.applyFilter(); // Re-aplicar filtros para actualizar la lista y el mapa
  }

  /**
   * Muestra la ubicación de un sensor específico en el mapa, junto con el polígono de su cultivo.
   * Si no se selecciona un sensor específico, muestra el polígono del cultivo seleccionado y todos sus sensores.
   */
  updateMapForSelectedCultivo(): void {
    if (!this.mapComponent) {
      this.snackBar.open('El componente de mapa no está disponible.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.mapComponent.clearAllMarkers(); // Limpiar marcadores anteriores
    this.mapComponent.resetMap(); // Limpiar el polígono anterior también

    let cultivationAreaToShow: CultivationArea | undefined = undefined; // Puede ser undefined
    let sensorsToDisplayOnMap: google.maps.LatLngLiteral[] = [];

    if (this.selectedCultivo && this.selectedCultivo !== 'Todos los Cultivos') {
      cultivationAreaToShow = this.cultivationAreas.find(c => c.nombre === this.selectedCultivo);

      if (cultivationAreaToShow) {
        // Obtener solo los sensores filtrados que pertenecen a este cultivo
        sensorsToDisplayOnMap = this.filteredSensors
          .filter(s => s.cultivo === cultivationAreaToShow!.nombre)
          .map(s => ({ lat: s.latitud, lng: s.longitud }));

        // Asignar las coordenadas del polígono (asegurando que no sea undefined)
        this.mapComponent.cultivationPolygonCoords = cultivationAreaToShow.coordenadas || null;
        this.mapComponent.displaySensorMarkers(sensorsToDisplayOnMap);

      } else {
        this.snackBar.open(`No se encontró información de polígono para el cultivo: ${this.selectedCultivo}`, 'Cerrar', { duration: 3000 });
        this.mapComponent.cultivationPolygonCoords = null; // Asegurar que es null
        this.mapComponent.resetMap(); // Limpiar el mapa si no hay polígono
      }
    } else {
      // Si "Todos los Cultivos" está seleccionado, no mostrar ningún polígono.
      // Asegurar que cultivationPolygonCoords sea null.
      this.mapComponent.cultivationPolygonCoords = null;
      this.mapComponent.resetMap();
      // Si quieres mostrar todos los sensores en el mapa cuando "Todos los Cultivos" está seleccionado:
      // sensorsToDisplayOnMap = this.filteredSensors.map(s => ({ lat: s.latitud, lng: s.longitud }));
      // this.mapComponent.displaySensorMarkers(sensorsToDisplayOnMap);
    }
  }

  /**
   * Muestra la ubicación de un sensor específico en el mapa y su polígono de cultivo.
   * @param sensor Los datos del sensor a visualizar.
   */
  verMapa(sensor: SensorData): void {
    if (this.mapComponent) {
      // Encontrar el área de cultivo asociada a este sensor
      const cultivationArea = this.cultivationAreas.find(c => c.nombre === sensor.cultivo);

      if (cultivationArea) {
        this.mapComponent.cultivationPolygonCoords = cultivationArea.coordenadas || null; // Asegurar que es null
        this.mapComponent.displaySensorMarkers([{ lat: sensor.latitud, lng: sensor.longitud }]); // Mostrar solo este sensor
        // Centrar el mapa en el marcador del sensor y ajustar el zoom
        this.mapComponent.map.googleMap!.setCenter({ lat: sensor.latitud, lng: sensor.longitud });
        this.mapComponent.map.googleMap!.setZoom(15);
      } else {
        this.snackBar.open(`No se encontró polígono para el cultivo: ${sensor.cultivo}`, 'Cerrar', { duration: 3000 });
        this.mapComponent.cultivationPolygonCoords = null; // Asegurar que es null
        this.mapComponent.resetMap(); // Limpiar el mapa si no hay polígono
        this.mapComponent.displaySensorMarkers([{ lat: sensor.latitud, lng: sensor.longitud }]); // Aún así mostrar el sensor si no hay polígono
      }
    } else {
      this.snackBar.open('El componente de mapa no está disponible.', 'Cerrar', { duration: 3000 });
    }
  }
}
